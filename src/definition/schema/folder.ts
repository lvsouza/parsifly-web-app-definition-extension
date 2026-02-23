import { relations, sql } from 'drizzle-orm';
import { pgTable, AnyPgColumn, varchar, uuid, timestamp, check, unique } from 'drizzle-orm/pg-core';

import { projectVariable } from './projectVariable';
import { projectListener } from './projectListener';
import { projectAction } from './projectAction';
import { projectEvent } from './projectEvent';
import { structure } from './structure';
import { external } from './external';
import { project } from './project';
import { enumTable } from './enum';


export const folder = pgTable('folder', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name').notNull(),
  type: varchar('type').notNull().default('folder'),
  of: varchar('of').notNull(),
  description: varchar('description'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references((): AnyPgColumn => folder.id, { onDelete: 'cascade' }),
}, table => [
  check('folder_type_check', sql`${table.type} in ('folder')`),

  check('folder_parent_not_self', sql`${table.parentFolderId} <> ${table.id}`),

  check('folder__project_or_folder_not_null', sql`(
      (${table.parentProjectId} IS NOT NULL AND ${table.parentFolderId} IS NULL)
      OR
      (${table.parentProjectId} IS NULL AND ${table.parentFolderId} IS NOT NULL)
    )`),

  unique('folder__name_of_parentFolderId_parentProjectId')
    .on(
      table.name,
      table.of,
      table.parentFolderId,
      table.parentProjectId
    )
    .nullsNotDistinct(),
]);
export const folderRelations = relations(folder, ({ one, many }) => ({

  // Own
  projectOwner: one(project, {
    fields: [folder.projectOwnerId],
    references: [project.id],
    relationName: 'folder_projectOwner',
  }),
  parentProject: one(project, {
    fields: [folder.parentProjectId],
    references: [project.id],
    relationName: 'folder_parentProject',
  }),
  parentFolder: one(folder, {
    fields: [folder.parentFolderId],
    references: [folder.id],
    relationName: 'folder_parentFolder',
  }),
  childrenFolders: many(folder, {
    relationName: 'folder_parentFolder'
  }),

  // Enum
  childrenEnums: many(enumTable, {
    relationName: 'enum_parentFolder'
  }),

  // Structure
  childrenStructures: many(structure, {
    relationName: 'structure_parentFolder'
  }),

  // External
  childrenExternals: many(external, {
    relationName: 'external_parentFolder'
  }),

  // ProjectVariable
  childrenProjectVariables: many(projectVariable, {
    relationName: 'projectVariable_parentFolder'
  }),

  // ProjectAction
  childrenProjectActions: many(projectAction, {
    relationName: 'projectAction_parentFolder'
  }),

  // ProjectEvent
  childrenProjectEvents: many(projectEvent, {
    relationName: 'projectEvent_parentFolder'
  }),

  // ProjectListener
  childrenProjectListeners: many(projectListener, {
    relationName: 'projectListener_parentFolder'
  }),
}))


export type Folder = typeof folder.$inferSelect;
export type NewFolder = typeof folder.$inferInsert;
export type FolderUpdate = Partial<typeof folder.$inferInsert>;
