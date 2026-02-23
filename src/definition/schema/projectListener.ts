import { pgTable, varchar, uuid, boolean, check } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

import { project } from './project';
import { folder } from './folder';
import { action } from './action';
import { event } from './event';


export const projectListener = pgTable('projectListener', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  public: boolean('public').notNull().default(false),
  type: varchar('type').notNull().default('projectListener'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),

  eventId: uuid('eventId').references(() => event.id, { onDelete: 'cascade' }),
  actionId: uuid('actionId').references(() => action.id, { onDelete: 'cascade' }),
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

  event: one(event, {
    fields: [projectListener.eventId],
    references: [event.id],
    relationName: 'projectListener_event',
  }),
  action: one(action, {
    fields: [projectListener.actionId],
    references: [action.id],
    relationName: 'projectListener_action',
  }),
}));
