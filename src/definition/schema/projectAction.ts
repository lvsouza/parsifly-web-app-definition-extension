import { sql } from 'drizzle-orm';
import { pgTable, varchar, uuid, boolean, check } from 'drizzle-orm/pg-core';

import { project } from './project';
import { folder } from './folder';
import { action } from './action';


export const projectAction = pgTable('projectAction', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  public: boolean('public').notNull().default(false),
  type: varchar('type').notNull().default('projectAction'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),
  actionId: uuid('actionId').notNull().references(() => action.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectAction_type_check', sql`${table.type} in ('projectAction')`),
  check('projectAction_project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
]);

export type ProjectAction = typeof projectAction.$inferSelect;
export type NewProjectAction = typeof projectAction.$inferInsert;
export type ProjectActionUpdate = Partial<typeof projectAction.$inferInsert>;
