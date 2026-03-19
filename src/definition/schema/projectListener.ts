import { pgTable, varchar, uuid, boolean, check } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

import { projectAction } from './projectAction';
import { projectEvent } from './projectEvent';
import { project } from './project';
import { folder } from './folder';


export const projectListener = pgTable('projectListener', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  public: boolean('public').notNull().default(false),
  type: varchar('type').notNull().default('projectListener'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),

  projectEventId: uuid('projectEventId').references(() => projectEvent.id, { onDelete: 'cascade' }),
  projectActionId: uuid('projectActionId').references(() => projectAction.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectListener_type_check', sql`${table.type} in ('projectListener')`),
  check('projectListener_project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
]);
export const projectListenerRelations = relations(projectListener, ({ one }) => ({
  projectOwner: one(project, {
    fields: [projectListener.projectOwnerId],
    references: [project.id],
    relationName: 'projectListener_projectOwner',
  }),
  parentFolder: one(folder, {
    fields: [projectListener.parentFolderId],
    references: [folder.id],
    relationName: 'projectListener_parentFolder',
  }),
  parentProject: one(project, {
    fields: [projectListener.parentProjectId],
    references: [project.id],
    relationName: 'projectListener_parentProject',
  }),

  projectEvent: one(projectEvent, {
    fields: [projectListener.projectEventId],
    references: [projectEvent.id],
    relationName: 'projectListener_projectEvent',
  }),
  projectAction: one(projectAction, {
    fields: [projectListener.projectActionId],
    references: [projectAction.id],
    relationName: 'projectListener_projectAction',
  }),
}));

export type ProjectListener = typeof projectListener.$inferSelect;
export type NewProjectListener = typeof projectListener.$inferInsert;
export type ProjectListenerUpdate = Partial<typeof projectListener.$inferInsert>;
