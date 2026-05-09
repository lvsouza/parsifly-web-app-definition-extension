import { sql } from 'drizzle-orm';
import { pgTable, AnyPgColumn, varchar, uuid, timestamp, check, unique } from 'drizzle-orm/pg-core';

import { project } from './project';


export const folder = pgTable('folder', {
  id: uuid('id').primaryKey().defaultRandom(),
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


export type Folder = typeof folder.$inferSelect;
export type NewFolder = typeof folder.$inferInsert;
export type FolderUpdate = Partial<typeof folder.$inferInsert>;
