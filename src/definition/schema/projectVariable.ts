import { sql } from 'drizzle-orm';
import { pgTable, varchar, uuid, boolean, check } from 'drizzle-orm/pg-core';

import { property } from './property';
import { project } from './project';
import { folder } from './folder';


export const projectVariable = pgTable('projectVariable', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  public: boolean('public').notNull().default(false),
  type: varchar('type').notNull().default('projectVariable'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectVariable_type_check', sql`${table.type} in ('projectVariable')`),
  check('projectVariable_project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
]);

export type ProjectVariable = typeof projectVariable.$inferSelect;
export type NewProjectVariable = typeof projectVariable.$inferInsert;
export type ProjectVariableUpdate = Partial<typeof projectVariable.$inferInsert>;
