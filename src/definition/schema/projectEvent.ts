import { pgTable, varchar, uuid, boolean, check } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

import { projectListener } from './projectListener';
import { componentListener } from './component';
import { pageListener } from './page';
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
  eventId: uuid('eventId').references(() => event.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectEvent_type_check', sql`${table.type} in ('projectEvent')`),
  check('projectEvent_project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
]);
export const projectEventRelations = relations(projectEvent, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [projectEvent.projectOwnerId],
    references: [project.id],
    relationName: 'projectEvent_projectOwner',
  }),
  parentFolder: one(folder, {
    fields: [projectEvent.parentFolderId],
    references: [folder.id],
    relationName: 'projectEvent_parentFolder',
  }),
  parentProject: one(project, {
    fields: [projectEvent.parentProjectId],
    references: [project.id],
    relationName: 'projectEvent_parentProject',
  }),
  event: one(event, {
    fields: [projectEvent.eventId],
    references: [event.id],
    relationName: 'projectEvent_event',
  }),

  projectListeners: many(projectListener, {
    relationName: 'projectListener_projectEvent'
  }),
  componentListeners: many(componentListener, {
    relationName: 'componentListener_projectEvent'
  }),
  pageListeners: many(pageListener, {
    relationName: 'pageListener_projectEvent'
  }),
}));
