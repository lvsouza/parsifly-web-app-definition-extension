import { Kysely, sql } from 'kysely'

import { createMigration } from '../MigrationHelper'
import { TMigration } from 'parsifly-extension-base'
import { Database } from '../DatabaseTypes'


export const _005_createStructureMigration = (databaseHelper: Kysely<Database>): TMigration[] => {
  return [
    createMigration('create-web-app-data-types', () => {
      return databaseHelper.schema
        .createType('enum_web_app_data_type')
        .asEnum([
          'enum',
          'structure',

          'string',
          'number',
          'boolean',
          'null',
          'object',
          'binary',

          'array_enum',
          'array_structure',

          'array_string',
          'array_number',
          'array_boolean',
          'array_null',
          'array_object',
          'array_binary',
        ])
        .compile()
    }, 'Create web app data types'),

    createMigration('create-structure-table', () => {
      return databaseHelper.schema
        .createTable('structure')
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
        .addColumn('name', 'varchar', col => col.notNull().unique())
        .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('structure')`).defaultTo('structure'))
        .addColumn('description', 'varchar')
        .addColumn('public', 'boolean', col => col.defaultTo(false))
        .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

        .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))

        .addColumn('parentProjectId', 'uuid', col => col.references('project.id').onDelete('cascade'))
        .addColumn('parentFolderId', 'uuid', col => col.references('folder.id').onDelete('cascade'))
        .addCheckConstraint(
          'structure__project_or_folder_not_null',
          sql`(("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL) OR ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL))`
        )
        .compile()
    }, 'Create the project structures table'),

    createMigration('create-structure-attribute-table', () => {
      return databaseHelper.schema
        .createTable('structureAttribute')
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
        .addColumn('name', 'varchar', col => col.notNull())
        .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('structureAttribute')`).defaultTo('structureAttribute'))
        .addColumn('description', 'varchar')
        .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

        .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))


        .addColumn('dataType', sql`enum_web_app_data_type`, col => col.notNull().defaultTo('string'))
        .addColumn('defaultValue', 'jsonb')
        .addColumn('required', 'boolean', col => col.notNull().defaultTo(false))
        .addColumn('enumReferenceId', 'uuid', col => col.references('enum.id'))
        .addColumn('structureReferenceId', 'uuid', col => col.references('structure.id'))
        // CHECK: defaultValue só pode existir para string, number e boolean
        .addCheckConstraint(
          'structureAttribute__defaultValue_only_for_string_number_boolean',
          sql`"defaultValue" IS NULL OR ("dataType"::text IN ('string','number','boolean') AND jsonb_typeof("defaultValue") IN ('string','number','boolean'))`
        )
        // CHECK: garante que o enumReferenceId só tenha valor se o data type é enum ou array_enum
        .addCheckConstraint(
          'structureAttribute__enumReferenceId_only_for_enum_array_enum',
          sql`
            ("dataType"::text IN ('enum','array_enum') AND "enumReferenceId" IS NOT NULL)
            OR ("dataType"::text NOT IN ('enum','array_enum') AND "enumReferenceId" IS NULL)
          `
        )
        // CHECK: garante que o structureReferenceId só tenha valor se o data type é structure ou array_structure
        .addCheckConstraint(
          'structureAttribute__structureReferenceId_only_for_structure_array_structure',
          sql`
            ("dataType"::text IN ('structure','array_structure') AND "structureReferenceId" IS NOT NULL)
            OR ("dataType"::text NOT IN ('structure','array_structure') AND "structureReferenceId" IS NULL)
          `
        )


        .addColumn('parentStructureId', 'uuid', col => col.references('structure.id').onDelete('cascade'))
        .addColumn('parentStructureAttributeId', 'uuid', col => col.references('structureAttribute.id').onDelete('cascade'))
        // CHECK: Força a referência para uma structure ou um structure attribute
        .addCheckConstraint(
          'structureAttribute__structure_or_structureAttribute_not_null',
          sql`(("parentStructureId" IS NOT NULL AND "parentStructureAttributeId" IS NULL) OR ("parentStructureId" IS NULL AND "parentStructureAttributeId" IS NOT NULL))`
        )
        .addUniqueConstraint(
          'structureAttribute__name_parentStructureId_parentStructureAttributeId',
          ['name', 'parentStructureId', 'parentStructureAttributeId'],
          builder => builder.nullsNotDistinct()
        )
        .compile()
    }, 'Create the project structure attributes table'),

    createMigration('create-structureAttribute-trigger-to-call-function-to-prevent-self-reference', () => {
      return sql`
      -- Create trigger
      CREATE TRIGGER structure_attribute_no_cycles
      BEFORE INSERT OR UPDATE OF "parentStructureAttributeId"
      ON "structureAttribute"
      FOR EACH ROW
      WHEN (NEW."parentStructureAttributeId" IS NOT NULL)
      EXECUTE FUNCTION prevent_cycles_generic(
        'structureAttribute',
        'id',
        'parentStructureAttributeId'
      );
    `.compile(databaseHelper)
    }, 'Create trigger for prevent self reference'),

    createMigration('create-structureAttribute-function-to-prevent-create-link-to-a-parent-not-in-object-or-array_object', () => {
      return sql`
      -- Create function
      CREATE OR REPLACE FUNCTION validate_parent_structure_attribute()
      RETURNS trigger AS $$
      DECLARE
        parent_type text;
      BEGIN
        -- Se não tem parent, não valida nada
        IF NEW."parentStructureAttributeId" IS NULL THEN
          RETURN NEW;
        END IF;

        SELECT "dataType"
        INTO parent_type
        FROM "structureAttribute"
        WHERE "id" = NEW."parentStructureAttributeId";

        IF parent_type NOT IN ('object', 'array_object') THEN
          RAISE EXCEPTION
            USING
              MESSAGE = 'Invalid parent structure attribute',
              DETAIL = 'Parent attribute must have dataType object or array_object',
              HINT = 'Choose an attribute with a compatible dataType';
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `.compile(databaseHelper)
    }, 'Create function to prevent parent dataType not in (object ou array_object)'),

    createMigration('create-structureAttribute-trigger-to-call-function-to-prevent-create-link-to-a-parent-not-in-object-or-array_object', () => {
      return sql`
      -- Create trigger
      CREATE TRIGGER structure_attribute_parent_check
      BEFORE INSERT OR UPDATE OF "parentStructureAttributeId"
      ON "structureAttribute"
      FOR EACH ROW
      EXECUTE FUNCTION validate_parent_structure_attribute();
    `.compile(databaseHelper)
    }, 'Create trigger for prevent parent not in object or array_object'),
  ]
}
