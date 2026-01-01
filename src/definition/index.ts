import { ProjectDescriptor, TApplication } from 'parsifly-extension-base';
import { Kysely, sql } from 'kysely'

import { EventLinkDialect } from './SQLDriver';
import { Database } from './DatabaseTypes';


export const dbQueryBuilder = new Kysely<Database>({ dialect: new EventLinkDialect() });


export const createDefinition = (_application: TApplication) => {
  return new ProjectDescriptor({
    version: 1,
    color: 'blue',
    key: 'web-app',
    name: 'Web App',
    type: 'web-app',
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
        upQuery: () => dbQueryBuilder.schema
          .createTable('project')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull().unique())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('web-app')`).defaultTo('web-app'))
          .addColumn('description', 'varchar')
          .addColumn('version', 'varchar', col => col.defaultTo('1.0.0'))
          .addColumn('public', 'boolean', col => col.defaultTo(false))
          .compile(),
      },
      {
        order: 2,
        id: '002__create-folder-table',
        description: 'Create the project folders table',
        upQuery: () => dbQueryBuilder.schema
          .createTable('folder')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull().unique())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('folder')`).defaultTo('folder'))
          .addColumn('description', 'varchar')
          .addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))

          .addColumn('projectOwnerId', 'uuid', col => col.notNull().references('project.id').onDelete('cascade'))

          .addColumn('parentProjectId', 'uuid', col => col.references('project.id').onDelete('cascade'))
          .addColumn('parentFolderId', 'uuid', col => col.references('folder.id').onDelete('cascade').check(sql`"parentFolderId" <> id`))
          .addCheckConstraint(
            'folder__project_or_folder_not_null',
            sql`(("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL) OR ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL))`
          )
          .compile(),
      },
      {
        order: 3,
        id: '003__create-function-to-prevent-folder-deep-self-reference',
        description: 'Create the project folders table',
        upQuery: () => sql`
          -- Create function
          CREATE OR REPLACE FUNCTION prevent_folder_cycles()
          RETURNS trigger AS $$
          BEGIN
            IF NEW."parentFolderId" IS NULL THEN
              RETURN NEW;
            END IF;

            IF EXISTS (
              WITH RECURSIVE ancestors AS (
                -- Anchor
                SELECT id, "parentFolderId"
                FROM folder
                WHERE id = NEW."parentFolderId"

                UNION ALL

                -- Recursion
                SELECT f.id, f."parentFolderId"
                FROM folder f
                JOIN ancestors a ON f.id = a."parentFolderId"
                -- Repare: não precisamos mais do WHERE NOT IN manual aqui
              )
              -- A Mágica do Postgres 14+:
              CYCLE id SET is_cycle USING path
              
              SELECT 1
              FROM ancestors
              WHERE id = NEW.id
              -- Opcional: Se quiser garantir que não considera ciclos pre-existentes como o próprio erro:
              AND is_cycle IS FALSE 
            ) THEN
              RAISE EXCEPTION
                USING
                  MESSAGE = 'Invalid folder hierarchy',
                  DETAIL = 'A folder cannot be moved into itself or one of its descendants',
                  HINT = 'Choose a different parent folder';
            END IF;

            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `.compile(dbQueryBuilder),
      },
      {
        order: 4,
        id: '004__create-folder-trigger-to-call-function-to-prevent-self-reference',
        description: 'Create the project folders table',
        upQuery: () => sql`
          -- Create trigger in the table to call the function
          CREATE TRIGGER folder_no_cycles
          BEFORE INSERT OR UPDATE OF "parentFolderId"
          ON folder
          FOR EACH ROW
          WHEN (NEW."parentFolderId" IS NOT NULL)
          EXECUTE FUNCTION prevent_folder_cycles();
        `.compile(dbQueryBuilder),
      },
      {
        order: 5,
        id: '005__create-page-table',
        description: 'Create the project pages table',
        upQuery: () => dbQueryBuilder.schema
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
        upQuery: () => dbQueryBuilder.schema
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
        upQuery: () => dbQueryBuilder.schema
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
        id: '008_create-project-item',
        description: 'Create the project item',
        upQuery: () => dbQueryBuilder
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

export const getHasAcceptableProject = async () => {
  try {
    const project = await dbQueryBuilder
      .selectFrom('project')
      .select('type')
      .executeTakeFirst();

    return project?.type === 'web-app';
  } catch (error) {
    return false;
  }
}
