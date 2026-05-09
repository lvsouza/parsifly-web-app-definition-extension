import { sql } from 'drizzle-orm';
import { boolean, check, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';


export const project = pgTable('project', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('project'),
  projectType: varchar('projectType').notNull().default('webApp'),
  definitionVersion: integer('definitionVersion').notNull().default(1),
  description: varchar('description'),
  version: varchar('version').default('1.0.0'),
  public: boolean('public').default(false),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('project')`),
  check('project_type_check', sql`${table.projectType} in ('webApp')`),
  check('def_version_check', sql`${table.definitionVersion} in (1)`),
]);

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
export type ProjectUpdate = Partial<typeof project.$inferInsert>;
