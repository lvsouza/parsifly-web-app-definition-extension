import { pgTable, varchar, uuid, boolean, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { project } from './project';
import { folder } from './folder';
import { event } from './event';


export const projectEvent = pgTable('projectEvent', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  public: boolean('public').notNull().default(false),
  type: varchar('type').notNull().default('projectEvent'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),
  eventId: uuid('eventId').notNull().references(() => event.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectEvent_type_check', sql`${table.type} in ('projectEvent')`),
  check('projectEvent_project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
]);

export type ProjectEvent = typeof projectEvent.$inferSelect;
export type NewProjectEvent = typeof projectEvent.$inferInsert;
export type ProjectEventUpdate = Partial<typeof projectEvent.$inferInsert>;
