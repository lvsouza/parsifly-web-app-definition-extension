import { ProjectDescriptor, TExtensionContext } from 'parsifly-extension-base';
import { sql } from 'kysely'

import { _002_createNoSelfReferenceFunctionMigration } from './migrations/002_CreateNoSelfReferenceFunctionMigration';
import { _005_createStructureMigration } from './migrations/005_CreateStructureMigration';
import { _001_createProjectMigration } from './migrations/001_CreateProjectMigration';
import { _003_createFolderMigration } from './migrations/003_CreateFolderMigration';
import { _004_createEnumMigration } from './migrations/004_CreateEnumMigration';
import { createDatabaseHelper } from './DatabaseHelper';
import { createMigration } from './MigrationHelper';


export const createDefinition = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

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
      ..._001_createProjectMigration(databaseHelper),

      ..._002_createNoSelfReferenceFunctionMigration(databaseHelper),

      ..._003_createFolderMigration(databaseHelper),

      ..._004_createEnumMigration(databaseHelper),

      ..._005_createStructureMigration(databaseHelper),

      createMigration('create-page-table', () => {
        return databaseHelper.schema
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
          .compile()
      }, 'Create the project pages table'),

      createMigration('create-component-table', () => {
        return databaseHelper.schema
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
          .compile()
      }, 'Create the project components table'),

      createMigration('create-action-table', () => {
        return databaseHelper.schema
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
          .compile()
      }, 'Create the project actions table'),

      createMigration('create-project-item', () => {
        return databaseHelper
          .insertInto('project')
          .values({
            public: false,
            name: 'Unnamed',
            version: '1.0.0',
            description: 'Default description',
          })
          .compile()
      }, 'Create the project item'),
    ],
  });
}

export const getHasAcceptableProject = async (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  try {
    const project = await databaseHelper
      .selectFrom('project')
      .select('projectType')
      .executeTakeFirst();

    return project?.projectType === 'webApp';
  } catch (error) {
    return false;
  }
}
