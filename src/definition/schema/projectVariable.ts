import { pgTable, varchar, uuid, boolean, check } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

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
  propertyId: uuid('propertyId').references(() => property.id, { onDelete: 'cascade' }),
}, (table) => [
  check('projectVariable_type_check', sql`${table.type} in ('projectVariable')`),
]);
export const projectVariableRelations = relations(projectVariable, ({ one }) => ({
  projectOwner: one(project, {
    fields: [projectVariable.projectOwnerId],
    references: [project.id],
    relationName: 'projectVariable_projectOwner',
  }),
  parentFolder: one(folder, {
    fields: [projectVariable.parentFolderId],
    references: [folder.id],
    relationName: 'projectVariable_parentFolder',
  }),
  parentProject: one(project, {
    fields: [projectVariable.parentProjectId],
    references: [project.id],
    relationName: 'projectVariable_parentProject',
  }),
  property: one(property, {
    fields: [projectVariable.propertyId],
    references: [property.id],
    relationName: 'projectVariable_property',
  }),
}));
