import { pgTable, uuid, boolean, timestamp, check, varchar } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

import { projectEvent } from './projectEvent';
import { componentEvent } from './component';
import { routerNode } from './router';
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
export const pageRelations = relations(page, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [page.projectOwnerId],
    references: [project.id],
    relationName: 'page_projectOwner',
  }),

  parentProject: one(project, {
    fields: [page.parentProjectId],
    references: [project.id],
    relationName: 'page_parentProject',
  }),

  parentFolder: one(folder, {
    fields: [page.parentFolderId],
    references: [folder.id],
    relationName: 'page_parentFolder',
  }),

  pageParameters: many(pageParameter, {
    relationName: 'pageParameter_parentPage',
  }),

  pageVariables: many(pageVariable, {
    relationName: 'pageVariable_parentPage',
  }),

  pageActions: many(pageAction, {
    relationName: 'pageAction_parentPage',
  }),

  pageListeners: many(pageListener, {
    relationName: 'pageListener_parentPage',
  }),

  pageContents: many(pageContent, {
    relationName: 'pageContent_parentPage',
  }),

  routerNodes: many(routerNode, {
    relationName: 'routerNode_page',
  }),
}));

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
export const pageParameterRelations = relations(pageParameter, ({ one }) => ({
  projectOwner: one(project, {
    fields: [pageParameter.projectOwnerId],
    references: [project.id],
    relationName: 'pageParameter_projectOwner',
  }),

  property: one(property, {
    fields: [pageParameter.propertyId],
    references: [property.id],
    relationName: 'pageParameter_property',
  }),

  parentPage: one(page, {
    fields: [pageParameter.parentPageId],
    references: [page.id],
    relationName: 'pageParameter_parentPage',
  }),
}));

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
export const pageVariableRelations = relations(pageVariable, ({ one }) => ({
  projectOwner: one(project, {
    fields: [pageVariable.projectOwnerId],
    references: [project.id],
    relationName: 'pageVariable_projectOwner',
  }),

  property: one(property, {
    fields: [pageVariable.propertyId],
    references: [property.id],
    relationName: 'pageVariable_property',
  }),

  parentPage: one(page, {
    fields: [pageVariable.parentPageId],
    references: [page.id],
    relationName: 'pageVariable_parentPage',
  }),
}));

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
export const pageActionRelations = relations(pageAction, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [pageAction.projectOwnerId],
    references: [project.id],
    relationName: 'pageAction_projectOwner',
  }),

  action: one(action, {
    fields: [pageAction.actionId],
    references: [action.id],
    relationName: 'pageAction_action',
  }),

  parentPage: one(page, {
    fields: [pageAction.parentPageId],
    references: [page.id],
    relationName: 'pageAction_parentPage',
  }),

  pageListeners: many(pageListener, {
    relationName: 'pageListener_componentEvent'
  })
}));

export type PageAction = typeof pageAction.$inferSelect;
export type NewPageAction = typeof pageAction.$inferInsert;
export type PageActionUpdate = Partial<typeof pageAction.$inferInsert>;


export const pageListener = pgTable('pageListener', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('pageListener'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  projectEventId: uuid('projectEventId').references(() => projectEvent.id, { onDelete: 'cascade' }),
  componentEventId: uuid('componentEventId').references(() => componentEvent.id, { onDelete: 'cascade' }),
  pageActionId: uuid('pageActionId').references(() => pageAction.id, { onDelete: 'cascade' }),
  parentPageId: uuid('parentPageId').notNull().references(() => page.id, { onDelete: 'cascade' }),
}, () => [
  check('pageListener__type_is_pageListener', sql`type in ('pageListener')`),
]);
export const pageListenerRelations = relations(pageListener, ({ one }) => ({
  projectOwner: one(project, {
    fields: [pageListener.projectOwnerId],
    references: [project.id],
    relationName: 'pageListener_projectOwner',
  }),

  projectEvent: one(projectEvent, {
    fields: [pageListener.projectEventId],
    references: [projectEvent.id],
    relationName: 'pageListener_projectEvent',
  }),

  componentEvent: one(componentEvent, {
    fields: [pageListener.componentEventId],
    references: [componentEvent.id],
    relationName: 'pageListener_componentEvent',
  }),

  pageAction: one(pageAction, {
    fields: [pageListener.pageActionId],
    references: [pageAction.id],
    relationName: 'pageListener_pageAction',
  }),

  parentPage: one(page, {
    fields: [pageListener.parentPageId],
    references: [page.id],
    relationName: 'pageListener_parentPage',
  }),
}));

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

export const pageContentRelations = relations(pageContent, ({ one }) => ({
  projectOwner: one(project, {
    fields: [pageContent.projectOwnerId],
    references: [project.id],
    relationName: 'pageContent_projectOwner',
  }),

  uiNode: one(uiNode, {
    fields: [pageContent.uiNodeId],
    references: [uiNode.id],
    relationName: 'pageContent_uiNode',
  }),

  parentPage: one(page, {
    fields: [pageContent.parentPageId],
    references: [page.id],
    relationName: 'pageContent_parentPage',
  }),
}));

export type PageContent = typeof pageContent.$inferSelect;
export type NewPageContent = typeof pageContent.$inferInsert;
export type PageContentUpdate = Partial<typeof pageContent.$inferInsert>;
