import { Kysely, sql } from 'kysely'

import { createMigration } from '../MigrationHelper'
import { TMigration } from 'parsifly-extension-base'
import { Database } from '../DatabaseTypes'


export const createProjectMigration = (databaseHelper: Kysely<Database>): TMigration[] => {
  return [
    createMigration('create-project-table', () => {
      return databaseHelper.schema
        .createTable('project')
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
        .addColumn('name', 'varchar', col => col.notNull().unique())
        .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('project')`).defaultTo('project'))
        .addColumn('projectType', 'varchar', col => col.notNull().check(sql`"projectType" in ('webApp')`).defaultTo('webApp'))
        .addColumn('definitionVersion', 'integer', col => col.notNull().check(sql`"definitionVersion" in (1)`).defaultTo(1))
        .addColumn('description', 'varchar')
        .addColumn('version', 'varchar', col => col.defaultTo('1.0.0'))
        .addColumn('public', 'boolean', col => col.defaultTo(false))
        .compile()
    }, 'Create the project table'),
  ]
}
