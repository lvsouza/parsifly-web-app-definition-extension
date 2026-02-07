import { Kysely, sql } from 'kysely'

import { createMigration } from '../MigrationHelper'
import { TMigration } from 'parsifly-extension-base'
import { Database } from '../DatabaseTypes'


export const _004_createEnumMigration = (databaseHelper: Kysely<Database>): TMigration[] => {
  return [
    createMigration('create-web-app-basic-data-types', () => {
      return databaseHelper.schema
        .createType('enum_web_app_basic_data_type')
        .asEnum([
          'string',
          'number',
          'boolean',
          'null',
        ])
        .compile()
    }, 'Create web app basic data types to be used in the enums attribute values'),

    createMigration('create-enum-table', () => {
      return databaseHelper.schema
        .createTable('enum')
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
        .addColumn('name', 'varchar', col => col.notNull().unique())
        .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('enum')`).defaultTo('enum'))
        .addColumn('description', 'varchar')
        .addColumn('public', 'boolean', col => col.defaultTo(false))
        .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

        .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))

        .addColumn('parentProjectId', 'uuid', col => col.references('project.id').onDelete('cascade'))
        .addColumn('parentFolderId', 'uuid', col => col.references('folder.id').onDelete('cascade'))
        .addCheckConstraint(
          'enum__project_or_folder_not_null',
          sql`(("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL) OR ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL))`
        )
        .compile()
    }, 'Create the project enums table'),

    createMigration('create-enum-attribute-table', () => {
      return databaseHelper.schema
        .createTable('enumAttribute')
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
        .addColumn('name', 'varchar', col => col.notNull())
        .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('enumAttribute')`).defaultTo('enumAttribute'))
        .addColumn('description', 'varchar')
        .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

        .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))


        .addColumn('dataType', sql`enum_web_app_basic_data_type`, col => col.notNull().defaultTo('string'))
        .addColumn('defaultValue', 'jsonb')
        .addColumn('required', 'boolean', col => col.notNull().defaultTo(false))
        // CHECK: defaultValue só pode existir para string, number e boolean
        .addCheckConstraint(
          'enumAttribute__defaultValue_only_for_string_number_boolean',
          sql`"defaultValue" IS NULL OR ("dataType"::text IN ('string','number','boolean') AND jsonb_typeof("defaultValue") IN ('string','number','boolean'))`
        )


        .addColumn('parentEnumId', 'uuid', col => col.notNull().references('enum.id').onDelete('cascade'))

        .addUniqueConstraint(
          'enumAttribute__name_parentEnumId',
          ['name', 'parentEnumId'],
          builder => builder.nullsNotDistinct()
        )
        .compile()
    }, 'Create the project enum attributes table'),

    createMigration('create-enum-value-table', () => {
      return databaseHelper.schema
        .createTable('enumValue')
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
        .addColumn('name', 'varchar', col => col.notNull())
        .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('enumValue')`).defaultTo('enumValue'))
        .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

        .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))
        .addColumn('parentEnumId', 'uuid', col => col.notNull().references('enum.id').onDelete('cascade'))

        .addUniqueConstraint(
          'enumValue__name_parentEnumId',
          ['name', 'parentEnumId'],
          builder => builder.nullsNotDistinct()
        )
        .compile()
    }, 'Create enum values table to store enums values. Each member of the enum is a row here.'),

    createMigration('create-enum-value-by-attribute-table', () => {
      return databaseHelper.schema
        .createTable('enumValueByAttribute')
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
        .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('enumValueByAttribute')`).defaultTo('enumValueByAttribute'))
        .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

        .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))


        .addColumn('value', 'jsonb')
        // CHECK: value só pode existir para string, number e boolean
        .addCheckConstraint(
          'enumValueByAttribute__value_only_for_string_number_boolean',
          sql`"value" IS NULL OR (jsonb_typeof("value") IN ('string','number','boolean'))`
        )


        .addColumn('parentEnumValueId', 'uuid', col => col.notNull().references('enumValue.id').onDelete('cascade'))
        .addColumn('parentEnumAttributeId', 'uuid', col => col.notNull().references('enumAttribute.id').onDelete('cascade'))

        .addUniqueConstraint(
          'enumValueByAttribute__parentEnumValueId_parentEnumAttributeId',
          ['parentEnumValueId', 'parentEnumAttributeId'],
          builder => builder.nullsNotDistinct()
        )
        .compile()
    }, 'Create table for store a enum value attribute value. Each enum can have multiple values(member of the enum), each member can have multiple attribute, here store the value of a attribute of each enum value.'),

    createMigration('create-function-sync-attributes-on-enumAttribute-insert', () => {
      return sql`
        -- 1. Função para inserir em enumValueByAttribute quando um novo enumAttribute é criado
        CREATE OR REPLACE FUNCTION sync_enum_values_on_attribute_insert()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO "enumValueByAttribute" (
            "projectOwnerId",
            "parentEnumValueId",
            "parentEnumAttributeId"
          )
          SELECT
            NEW."projectOwnerId", -- Mantém o mesmo dono do projeto
            ev."id",              -- ID do valor de enum existente
            NEW."id"              -- ID do novo atributo criado
          FROM "enumValue" ev
          WHERE ev."parentEnumId" = NEW."parentEnumId" -- Apenas valores do mesmo Enum pai
          ON CONFLICT ("parentEnumValueId", "parentEnumAttributeId") DO NOTHING; -- Evita duplicatas se já existir

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `.compile(databaseHelper)
    }, 'Create function to auto-populate enumValueByAttribute when a new enumAttribute is created'),

    createMigration('create-trigger-to-call-function-to-sync-attributes-on-enumAttribute-insert', () => {
      return sql`
        -- 2. Trigger que dispara APÓS a criação de um enumAttribute
        CREATE TRIGGER trg_enum_attribute_insert
        AFTER INSERT ON "enumAttribute"
        FOR EACH ROW
        EXECUTE FUNCTION sync_enum_values_on_attribute_insert();
      `.compile(databaseHelper)
    }, 'Create trigger to call function to auto-populate enumValueByAttribute when a new enumAttribute is created'),

    createMigration('create-function-sync-values-on-enumValue-insert', () => {
      return sql`
        -- 1. Função para inserir em enumValueByAttribute quando um novo enumValue é criado
        CREATE OR REPLACE FUNCTION sync_enum_attributes_on_value_insert()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO "enumValueByAttribute" (
            "projectOwnerId",
            "parentEnumValueId",
            "parentEnumAttributeId"
          )
          SELECT
            NEW."projectOwnerId", -- Mantém o mesmo dono do projeto
            NEW."id",             -- ID do novo valor de enum criado
            ea."id"               -- ID do atributo existente
          FROM "enumAttribute" ea
          WHERE ea."parentEnumId" = NEW."parentEnumId" -- Apenas atributos do mesmo Enum pai
          ON CONFLICT ("parentEnumValueId", "parentEnumAttributeId") DO NOTHING;

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `.compile(databaseHelper)
    }, 'Create function to auto-populate enumValueByAttribute when a new enumValue (member) is created'),

    createMigration('create-trigger-to-call-function-to-sync-values-on-enumValue-insert', () => {
      return sql`
        -- 2. Trigger que dispara APÓS a criação de um enumValue
        CREATE TRIGGER trg_enum_value_insert
        AFTER INSERT ON "enumValue"
        FOR EACH ROW
        EXECUTE FUNCTION sync_enum_attributes_on_value_insert();
      `.compile(databaseHelper)
    }, 'Create trigger to call function to auto-populate enumValueByAttribute when a new enumValue (member) is created'),
  ];
}
