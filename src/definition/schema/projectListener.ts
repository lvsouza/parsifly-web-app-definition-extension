import { pgTable, varchar, uuid, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { externalAction, externalEvent } from './external';
import { projectAction } from './projectAction';
import { projectEvent } from './projectEvent';
import { actionParameter } from './action';
import { expression } from './expression';
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


export const projectListenerActionParameter = pgTable('projectListenerActionParameter', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('projectListenerActionParameter'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  expressionId: uuid('expressionId').references(() => expression.id, { onDelete: 'cascade' }),

  projectListenerId: uuid('projectListenerId').references(() => projectListener.id, { onDelete: 'cascade' }),
  actionParameterId: uuid('actionParameterId').references(() => actionParameter.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectListenerActionParameter_type_check', sql`${table.type} in ('projectListenerActionParameter')`),
]);

export type ProjectListenerActionParameter = typeof projectListenerActionParameter.$inferSelect;
export type NewProjectListenerActionParameter = typeof projectListenerActionParameter.$inferInsert;
export type ProjectListenerActionParameterUpdate = Partial<typeof projectListenerActionParameter.$inferInsert>;
