import { pgTable, varchar, uuid, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { externalAction, externalEvent } from './external';
import { projectAction } from './projectAction';
import { projectEvent } from './projectEvent';
import { project } from './project';
import { folder } from './folder';


export const projectListener = pgTable('projectListener', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('projectListener'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),

  externalEventId: uuid('externalEventId').references(() => externalEvent.id, { onDelete: 'cascade' }),
  projectEventId: uuid('projectEventId').references(() => projectEvent.id, { onDelete: 'cascade' }),
  projectActionId: uuid('projectActionId').references(() => projectAction.id, { onDelete: 'cascade' }),
  externalActionId: uuid('externalActionId').references(() => externalAction.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectListener_type_check', sql`${table.type} in ('projectListener')`),
  check('projectListener_project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
]);

export type ProjectListener = typeof projectListener.$inferSelect;
export type NewProjectListener = typeof projectListener.$inferInsert;
export type ProjectListenerUpdate = Partial<typeof projectListener.$inferInsert>;
