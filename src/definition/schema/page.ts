import { pgTable, uuid, boolean, timestamp, check, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { externalAction, externalEvent } from './external';
import { projectAction } from './projectAction';
import { projectEvent } from './projectEvent';
import { property } from './property';
import { project } from './project';
import { action } from './action';
import { folder } from './folder';
import { uiNode } from './uiNode';


export const page = pgTable('page', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  description: varchar('description'),
  public: boolean('public').default(false),
  type: varchar('type').notNull().default('page'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),
}, () => [
  check('page__type_is_page', sql`type in ('page')`),
  check(
    'page__project_or_folder_not_null',
    sql`(
      ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
      OR
      ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
    )`,
  ),
]);

export type Page = typeof page.$inferSelect;
export type NewPage = typeof page.$inferInsert;
export type PageUpdate = Partial<typeof page.$inferInsert>;


export const pageParameter = pgTable('pageParameter', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('pageParameter'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentPageId: uuid('parentPageId').notNull().references(() => page.id, { onDelete: 'cascade' }),
}, () => [
  check('pageParameter__type_is_pageParameter', sql`type in ('pageParameter')`),
]);

export type PageParameter = typeof pageParameter.$inferSelect;
export type NewPageParameter = typeof pageParameter.$inferInsert;
export type PageParameterUpdate = Partial<typeof pageParameter.$inferInsert>;


export const pageVariable = pgTable('pageVariable', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('pageVariable'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentPageId: uuid('parentPageId').notNull().references(() => page.id, { onDelete: 'cascade' }),
}, () => [
  check('pageVariable__type_is_pageVariable', sql`type in ('pageVariable')`),
]);

export type PageVariable = typeof pageVariable.$inferSelect;
export type NewPageVariable = typeof pageVariable.$inferInsert;
export type PageVariableUpdate = Partial<typeof pageVariable.$inferInsert>;


export const pageAction = pgTable('pageAction', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('pageAction'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  actionId: uuid('actionId').notNull().references(() => action.id, { onDelete: 'cascade' }),
  parentPageId: uuid('parentPageId').notNull().references(() => page.id, { onDelete: 'cascade' }),
}, () => [
  check('pageAction__type_is_pageAction', sql`type in ('pageAction')`),
]);

export type PageAction = typeof pageAction.$inferSelect;
export type NewPageAction = typeof pageAction.$inferInsert;
export type PageActionUpdate = Partial<typeof pageAction.$inferInsert>;


export const pageListener = pgTable('pageListener', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  type: varchar('type').notNull().default('pageListener'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  pageActionId: uuid('pageActionId').references(() => pageAction.id, { onDelete: 'cascade' }),
  projectEventId: uuid('projectEventId').references(() => projectEvent.id, { onDelete: 'cascade' }),
  projectActionId: uuid('projectActionId').references(() => projectAction.id, { onDelete: 'cascade' }),
  externalEventId: uuid('externalEventId').references(() => externalEvent.id, { onDelete: 'cascade' }),
  externalActionId: uuid('externalActionId').references(() => externalAction.id, { onDelete: 'cascade' }),

  parentPageId: uuid('parentPageId').notNull().references(() => page.id, { onDelete: 'cascade' }),
}, () => [
  check('pageListener__type_is_pageListener', sql`type in ('pageListener')`),
]);

export type PageListener = typeof pageListener.$inferSelect;
export type NewPageListener = typeof pageListener.$inferInsert;
export type PageListenerUpdate = Partial<typeof pageListener.$inferInsert>;


export const pageContent = pgTable('pageContent', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('pageContent'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  uiNodeId: uuid('uiNodeId').notNull().references(() => uiNode.id, { onDelete: 'cascade' }),
  parentPageId: uuid('parentPageId').notNull().references(() => page.id, { onDelete: 'cascade' }),
}, () => [
  check('pageContent__type_is_pageContent', sql`type in ('pageContent')`),
]);

export type PageContent = typeof pageContent.$inferSelect;
export type NewPageContent = typeof pageContent.$inferInsert;
export type PageContentUpdate = Partial<typeof pageContent.$inferInsert>;
