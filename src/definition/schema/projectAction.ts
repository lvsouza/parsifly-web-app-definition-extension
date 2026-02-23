import { pgTable, varchar, uuid, boolean, check } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

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
  actionId: uuid('actionId').references(() => action.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectAction_type_check', sql`${table.type} in ('projectAction')`),
]);
export const projectActionRelations = relations(projectAction, ({ one }) => ({
  projectOwner: one(project, {
    fields: [projectAction.projectOwnerId],
    references: [project.id],
    relationName: 'projectAction_projectOwner',
  }),
  parentFolder: one(folder, {
    fields: [projectAction.parentFolderId],
    references: [folder.id],
    relationName: 'projectAction_parentFolder',
  }),
  parentProject: one(project, {
    fields: [projectAction.parentProjectId],
    references: [project.id],
    relationName: 'projectAction_parentProject',
  }),
  action: one(action, {
    fields: [projectAction.actionId],
    references: [action.id],
    relationName: 'projectAction_action',
  }),
}));
