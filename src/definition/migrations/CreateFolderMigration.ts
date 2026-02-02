import { Kysely, sql } from 'kysely'

import { createMigration } from '../MigrationHelper'
import { TMigration } from 'parsifly-extension-base'
import { Database } from '../DatabaseTypes'


export const createFolderMigration = (databaseHelper: Kysely<Database>): TMigration[] => {
  return [
    createMigration('create-folder-table', () => {
      return databaseHelper.schema
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
          'folder__name_of_parentFolderId_parentProjectId',
          ['name', 'of', 'parentFolderId', 'parentProjectId'],
          builder => builder.nullsNotDistinct()
        )
        .compile()
    }, 'Create the project folders table'),

    createMigration('create-folder-trigger-to-call-function-to-prevent-self-reference', () => {
      return sql`
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
    `.compile(databaseHelper)
    }, 'Create trigger for prevent self reference'),
  ]
}
