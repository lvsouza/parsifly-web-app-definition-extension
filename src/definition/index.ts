import { ProjectDescriptor, TApplication } from 'parsifly-extension-base';
import { sql } from 'kysely'

import { createDatabaseHelper } from './DatabaseHelper';


export const createDefinition = (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);

  return new ProjectDescriptor({
    version: 1,
    color: 'blue',
    key: 'webApp',
    name: 'Web App',
    type: 'webApp',
    icon: { type: 'page' },
    description: 'Aplicação web apenas frontend.',
    models: () => {
      return [
        {
          name: 'project',
          description: 'Store a the base properties of the project',
          properties: [
            { name: 'type', type: 'string', description: 'Type of the project', required: true },
            { name: 'id', type: 'string', description: 'Identifier of the project', required: true },
            { name: 'name', type: 'string', description: 'Unique name for the project', required: true },
            { name: 'description', type: 'string', description: 'A description for the project', required: false },
            { name: 'version', type: 'string', description: 'Version of the project', required: true },
            { name: 'public', type: 'boolean', description: '', required: true },
          ],
        },
        {
          name: 'folder',
          description: 'Store a folder to organize recourses from a project',
          properties: [
            { name: 'type', type: 'string', description: 'Type of the folder', required: true },
            { name: 'id', type: 'string', description: 'Identifier of the folder', required: true },
            { name: 'of', type: 'string', description: 'Where this folder is used', required: true },
            { name: 'name', type: 'string', description: 'Unique name for the folder', required: true },
            { name: 'description', type: 'string', description: 'A description for the folder', required: false },
            { name: 'createdAt', type: 'string', description: 'Store the datetime of creation', required: true },
            { name: 'projectOwnerId', type: 'string', description: 'Store the project owner reference', required: true },
            { name: 'parentProjectId', type: 'string', description: 'Store the parent item reference', required: false },
            { name: 'parentFolderId', type: 'string', description: 'Store the parent item reference', required: false },
          ],
        },
        {
          name: 'page',
          description: 'Store a page to organize recourses from a project',
          properties: [
            { name: 'type', type: 'string', description: 'Type of the page', required: true },
            { name: 'id', type: 'string', description: 'Identifier of the page', required: true },
            { name: 'name', type: 'string', description: 'Unique name for the page', required: true },
            { name: 'description', type: 'string', description: 'A description for the page', required: false },
            { name: 'public', type: 'boolean', description: '', required: true },
            { name: 'createdAt', type: 'string', description: 'Store the datetime of creation', required: true },
            { name: 'projectOwnerId', type: 'string', description: 'Store the project owner reference', required: true },
            { name: 'parentProjectId', type: 'string', description: 'Store the parent item reference', required: false },
            { name: 'parentFolderId', type: 'string', description: 'Store the parent item reference', required: false },
          ],
        },
      ];
    },
    migrations: () => [
      {
        order: 1,
        id: '001__create-project-table',
        description: 'Create the project table',
        upQuery: () => databaseHelper.schema
          .createTable('project')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull().unique())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('webApp')`).defaultTo('webApp'))
          .addColumn('description', 'varchar')
          .addColumn('version', 'varchar', col => col.defaultTo('1.0.0'))
          .addColumn('public', 'boolean', col => col.defaultTo(false))
          .compile(),
      },
      {
        order: 2,
        id: '002__create-folder-table',
        description: 'Create the project folders table',
        upQuery: () => databaseHelper.schema
          .createTable('folder')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('folder')`).defaultTo('folder'))
          .addColumn('of', 'varchar', col => col.notNull())
          .addColumn('description', 'varchar')
          .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

          .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))

          .addColumn('parentProjectId', 'uuid', col => col.references('project.id').onDelete('cascade'))
          .addColumn('parentFolderId', 'uuid', col => col.references('folder.id').onDelete('cascade').check(sql`"parentFolderId" <> id`))
          .addCheckConstraint(
            'folder__project_or_folder_not_null',
            sql`(("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL) OR ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL))`
          )
          .addUniqueConstraint(
            'folder__unique_name_for__name_of_parentFolderId_parentProjectId',
            ['name', 'of', 'parentFolderId', 'parentProjectId'],
            builder => builder.nullsNotDistinct()
          )
          .compile(),
      },
      {
        order: 3,
        id: '003__create-function-to-prevent-folder-deep-self-reference',
        description: 'Create the project folders table',
        upQuery: () => sql`
          -- Create function
          CREATE OR REPLACE FUNCTION prevent_cycles_generic()
          RETURNS trigger AS $$
          DECLARE
            table_name text := TG_ARGV[0];
            id_column text := TG_ARGV[1];
            parent_column text := TG_ARGV[2];

            sql text;
            has_cycle boolean;
          BEGIN
            -- Se o parent for NULL, não há risco
            EXECUTE format(
              'SELECT ($1).%I IS NULL',
              parent_column
            )
            USING NEW
            INTO has_cycle;

            IF has_cycle THEN
              RETURN NEW;
            END IF;

            sql := format($sql$
              WITH RECURSIVE ancestors AS (
                SELECT %1$I AS id, %2$I AS parent_id
                FROM %3$I
                WHERE %1$I = ($1).%2$I

                UNION ALL

                SELECT t.%1$I, t.%2$I
                FROM %3$I t
                JOIN ancestors a ON t.%1$I = a.parent_id
              )
              CYCLE id SET is_cycle USING path
              SELECT EXISTS (
                SELECT 1
                FROM ancestors
                WHERE id = ($1).%1$I
                  AND is_cycle IS FALSE
              )
            $sql$,
              id_column,
              parent_column,
              table_name
            );

            EXECUTE sql USING NEW INTO has_cycle;

            IF has_cycle THEN
              RAISE EXCEPTION
                USING
                  ERRCODE = 'P1001',
                  MESSAGE = format('Invalid hierarchy in %s', table_name),
                  DETAIL = 'An entity cannot be moved into itself or one of its descendants',
                  HINT = 'Choose a different parent';
            END IF;

            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `.compile(databaseHelper),
      },
      {
        order: 4,
        id: '004__create-folder-trigger-to-call-function-to-prevent-self-reference',
        description: 'Create trigger for prevent self reference',
        upQuery: () => sql`
          -- Create trigger
          CREATE TRIGGER folder_no_cycles
          BEFORE INSERT OR UPDATE OF "parentFolderId"
          ON folder
          FOR EACH ROW
          WHEN (NEW."parentFolderId" IS NOT NULL)
          EXECUTE FUNCTION prevent_cycles_generic(
            'folder',
            'id',
            'parentFolderId'
          );
        `.compile(databaseHelper),
      },
      {
        order: 5,
        id: '005__create-page-table',
        description: 'Create the project pages table',
        upQuery: () => databaseHelper.schema
          .createTable('page')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull().unique())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('page')`).defaultTo('page'))
          .addColumn('description', 'varchar')
          .addColumn('public', 'boolean', col => col.defaultTo(false))
          .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

          .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))

          .addColumn('parentProjectId', 'uuid', col => col.references('project.id').onDelete('cascade'))
          .addColumn('parentFolderId', 'uuid', col => col.references('folder.id').onDelete('cascade'))
          .addCheckConstraint(
            'page__project_or_folder_not_null',
            sql`(("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL) OR ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL))`
          )
          .compile(),
      },
      {
        order: 6,
        id: '006__create-component-table',
        description: 'Create the project components table',
        upQuery: () => databaseHelper.schema
          .createTable('component')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull().unique())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('component')`).defaultTo('component'))
          .addColumn('description', 'varchar')
          .addColumn('public', 'boolean', col => col.defaultTo(false))
          .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

          .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))

          .addColumn('parentProjectId', 'uuid', col => col.references('project.id').onDelete('cascade'))
          .addColumn('parentFolderId', 'uuid', col => col.references('folder.id').onDelete('cascade'))
          .addCheckConstraint(
            'component__project_or_folder_not_null',
            sql`(("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL) OR ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL))`
          )
          .compile(),
      },
      {
        order: 7,
        id: '007__create-action-table',
        description: 'Create the project actions table',
        upQuery: () => databaseHelper.schema
          .createTable('action')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull().unique())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('action')`).defaultTo('action'))
          .addColumn('description', 'varchar')
          .addColumn('public', 'boolean', col => col.defaultTo(false))
          .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

          .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))

          .addColumn('parentProjectId', 'uuid', col => col.references('project.id').onDelete('cascade'))
          .addColumn('parentFolderId', 'uuid', col => col.references('folder.id').onDelete('cascade'))
          .addCheckConstraint(
            'action__project_or_folder_not_null',
            sql`(("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL) OR ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL))`
          )
          .compile(),
      },
      {
        order: 8,
        id: '008__create-structure-table',
        description: 'Create the project structures table',
        upQuery: () => databaseHelper.schema
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
          .compile(),
      },
      {
        order: 9,
        id: '009__create-web-app-data-types',
        description: 'Create web app data types',
        upQuery: () => databaseHelper.schema
          .createType('enum_web_app_data_type')
          .asEnum([
            'structure',

            'string',
            'number',
            'boolean',
            'null',
            'object',
            'binary',

            'array_structure',

            'array_string',
            'array_number',
            'array_boolean',
            'array_null',
            'array_object',
            'array_binary',
          ])
          .compile(),
      },
      {
        order: 10,
        id: '0010__create-structure-attribute-table',
        description: 'Create the project structure attributes table',
        upQuery: () => databaseHelper.schema
          .createTable('structureAttribute')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('structureAttribute')`).defaultTo('structureAttribute'))
          .addColumn('description', 'varchar')
          .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

          .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))


          // CHECKs: Garantem que o dataType não pode ser alterado para um type diferente do tipo do defaultValue, deixe o defaultValue null então altere o dataType para oq ue quiser
          .addColumn('dataType', sql`enum_web_app_data_type`, col => col.notNull().defaultTo('string').check(sql`"defaultValue" IS NULL OR ("dataType"::text IN ('string','number','boolean') AND jsonb_typeof("defaultValue") = "dataType"::text)`))
          // CHECKs: Garantem que nunca possa ser salva um valor diferente de null, string, number ou boolean
          .addColumn('defaultValue', 'jsonb', col => col.check(sql`"defaultValue" IS NULL OR ("dataType"::text IN ('string','number','boolean') AND jsonb_typeof("defaultValue") = "dataType"::text)`))
          .addColumn('required', 'boolean', col => col.notNull().defaultTo(false))


          .addColumn('parentStructureId', 'uuid', col => col.references('structure.id').onDelete('cascade'))
          .addColumn('parentStructureAttributeId', 'uuid', col => col.references('structureAttribute.id').onDelete('cascade'))
          .addCheckConstraint(
            'structureAttribute__structure_or_structureAttribute_not_null',
            sql`(("parentStructureId" IS NOT NULL AND "parentStructureAttributeId" IS NULL) OR ("parentStructureId" IS NULL AND "parentStructureAttributeId" IS NOT NULL))`
          )
          .addUniqueConstraint(
            'structureAttribute__unique_name_for__name_parentStructureId_parentStructureAttributeId',
            ['name', 'parentStructureId', 'parentStructureAttributeId'],
            builder => builder.nullsNotDistinct()
          )
          .compile(),
      },
      {
        order: 11,
        id: '0011__create-structureAttribute-trigger-to-call-function-to-prevent-self-reference',
        description: 'Create trigger for prevent self reference',
        upQuery: () => sql`
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
        `.compile(databaseHelper),
      },
      {
        order: 12,
        id: '0012__create-structureAttribute-function-to-prevent-create-link-to-a-parent-not-in-object-or-array_object',
        description: 'Create function to prevent parent not in (object ou array_object)',
        upQuery: () => sql`
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
        `.compile(databaseHelper),
      },
      {
        order: 13,
        id: '0013__create-structureAttribute-trigger-to-call-function-to-prevent-create-link-to-a-parent-not-in-object-or-array_object',
        description: 'Create trigger for prevent parent not in object or array_object',
        upQuery: () => sql`
          -- Create trigger
          CREATE TRIGGER structure_attribute_parent_check
          BEFORE INSERT OR UPDATE OF "parentStructureAttributeId"
          ON "structureAttribute"
          FOR EACH ROW
          EXECUTE FUNCTION validate_parent_structure_attribute();
        `.compile(databaseHelper),
      },





      {
        order: 100,
        id: '00100_create-project-item',
        description: 'Create the project item',
        upQuery: () => databaseHelper
          .insertInto('project')
          .values({
            public: false,
            name: 'Unnamed',
            version: '1.0.0',
            description: 'Default description',
          })
          .compile(),
      }
    ],
  });
}

export const getHasAcceptableProject = async (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);

  try {
    const project = await databaseHelper
      .selectFrom('project')
      .select('type')
      .executeTakeFirst();

    return project?.type === 'webApp';
  } catch (error) {
    return false;
  }
}
