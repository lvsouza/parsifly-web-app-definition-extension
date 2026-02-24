import { boolean, check, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

import { projectAction } from './projectAction';
import { projectEvent } from './projectEvent';
import { property } from './property';
import { pageListener } from './page';
import { project } from './project';
import { folder } from './folder';
import { action } from './action';
import { uiNode } from './uiNode';
import { event } from './event';


export const component = pgTable('component', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('component'),
  description: varchar('description'),
  public: boolean('public').default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),
}, () => [
  check('component__type_is_component', sql`type in ('component')`),
  check('component__project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
]);
export const componentRelations = relations(component, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [component.projectOwnerId],
    references: [project.id],
    relationName: 'component_projectOwner',
  }),

  parentProject: one(project, {
    fields: [component.parentProjectId],
    references: [project.id],
    relationName: 'component_parentProject',
  }),

  parentFolder: one(folder, {
    fields: [component.parentFolderId],
    references: [folder.id],
    relationName: 'component_parentFolder',
  }),

  componentParameters: many(componentParameter, {
    relationName: 'componentParameter_parentComponent',
  }),

  componentVariables: many(componentVariable, {
    relationName: 'componentVariable_parentComponent',
  }),

  componentEvents: many(componentEvent, {
    relationName: 'componentEvent_parentComponent',
  }),

  componentActions: many(componentAction, {
    relationName: 'componentAction_parentComponent',
  }),

  componentListeners: many(componentListener, {
    relationName: 'componentListener_parentComponent',
  }),

  componentContents: many(componentContent, {
    relationName: 'componentContent_parentComponent',
  }),
}));

export type Component = typeof component.$inferSelect;
export type NewComponent = typeof component.$inferInsert;
export type ComponentUpdate = Partial<typeof component.$inferInsert>;


export const componentParameter = pgTable('componentParameter', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('componentParameter'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentComponentId: uuid('parentComponentId').notNull().references(() => component.id, { onDelete: 'cascade' }),
}, () => [
  check('componentParameter__type_is_componentParameter', sql`type in ('componentParameter')`),
]);
export const componentParameterRelations = relations(componentParameter, ({ one }) => ({
  projectOwner: one(project, {
    fields: [componentParameter.projectOwnerId],
    references: [project.id],
    relationName: 'componentParameter_projectOwner',
  }),

  property: one(property, {
    fields: [componentParameter.propertyId],
    references: [property.id],
    relationName: 'componentParameter_property',
  }),

  parentComponent: one(component, {
    fields: [componentParameter.parentComponentId],
    references: [component.id],
    relationName: 'componentParameter_parentComponent',
  }),
}));

export type ComponentParameter = typeof componentParameter.$inferSelect;
export type NewComponentParameter = typeof componentParameter.$inferInsert;
export type ComponentParameterUpdate = Partial<typeof componentParameter.$inferInsert>;


export const componentVariable = pgTable('componentVariable', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('componentVariable'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentComponentId: uuid('parentComponentId').notNull().references(() => component.id, { onDelete: 'cascade' }),
}, () => [
  check('componentVariable__type_is_componentVariable', sql`type in ('componentVariable')`),
]);
export const componentVariableRelations = relations(componentVariable, ({ one }) => ({
  projectOwner: one(project, {
    fields: [componentVariable.projectOwnerId],
    references: [project.id],
    relationName: 'componentVariable_projectOwner',
  }),

  property: one(property, {
    fields: [componentVariable.propertyId],
    references: [property.id],
    relationName: 'componentVariable_property',
  }),

  parentComponent: one(component, {
    fields: [componentVariable.parentComponentId],
    references: [component.id],
    relationName: 'componentVariable_parentComponent',
  }),
}));

export type ComponentVariable = typeof componentVariable.$inferSelect;
export type NewComponentVariable = typeof componentVariable.$inferInsert;
export type ComponentVariableUpdate = Partial<typeof componentVariable.$inferInsert>;


export const componentEvent = pgTable('componentEvent', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('componentEvent'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  eventId: uuid('eventId').notNull().references(() => event.id, { onDelete: 'cascade' }),
  parentComponentId: uuid('parentComponentId').notNull().references(() => component.id, { onDelete: 'cascade' }),
}, () => [
  check('componentEvent__type_is_componentEvent', sql`type in ('componentEvent')`),
]);
export const componentEventRelations = relations(componentEvent, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [componentEvent.projectOwnerId],
    references: [project.id],
    relationName: 'componentEvent_projectOwner',
  }),

  event: one(event, {
    fields: [componentEvent.eventId],
    references: [event.id],
    relationName: 'componentEvent_event',
  }),

  parentComponent: one(component, {
    fields: [componentEvent.parentComponentId],
    references: [component.id],
    relationName: 'componentEvent_parentComponent',
  }),

  componentListeners: many(componentListener, {
    relationName: 'componentListener_componentEvent',
  }),

  pageListeners: many(pageListener, {
    relationName: 'pageListener_pageEvent',
  }),
}));

export type ComponentEvent = typeof componentEvent.$inferSelect;
export type NewComponentEvent = typeof componentEvent.$inferInsert;
export type ComponentEventUpdate = Partial<typeof componentEvent.$inferInsert>;


export const componentAction = pgTable('componentAction', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('componentAction'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  actionId: uuid('actionId').notNull().references(() => action.id, { onDelete: 'cascade' }),
  parentComponentId: uuid('parentComponentId').notNull().references(() => component.id, { onDelete: 'cascade' }),
}, () => [
  check('componentAction__type_is_componentAction', sql`type in ('componentAction')`),
]);
export const componentActionRelations = relations(componentAction, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [componentAction.projectOwnerId],
    references: [project.id],
    relationName: 'componentAction_projectOwner',
  }),

  action: one(action, {
    fields: [componentAction.actionId],
    references: [action.id],
    relationName: 'componentAction_action',
  }),

  parentComponent: one(component, {
    fields: [componentAction.parentComponentId],
    references: [component.id],
    relationName: 'componentAction_parentComponent',
  }),

  componentListeners: many(componentListener, {
    relationName: 'componentListener_componentAction',
  }),
}));

export type ComponentAction = typeof componentAction.$inferSelect;
export type NewComponentAction = typeof componentAction.$inferInsert;
export type ComponentActionUpdate = Partial<typeof componentAction.$inferInsert>;


export const componentListener = pgTable('componentListener', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('componentListener'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  projectEventId: uuid('projectEventId').references(() => projectEvent.id, { onDelete: 'cascade' }),
  projectActionId: uuid('projectActionId').references(() => projectAction.id, { onDelete: 'cascade' }),
  componentEventId: uuid('componentEventId').references(() => componentEvent.id, { onDelete: 'cascade' }),
  componentActionId: uuid('componentActionId').references(() => componentAction.id, { onDelete: 'cascade' }),
  parentComponentId: uuid('parentComponentId').notNull().references(() => component.id, { onDelete: 'cascade' }),
}, () => [
  check('componentListener__type_is_componentListener', sql`type in ('componentListener')`),
]);
export const componentListenerRelations = relations(componentListener, ({ one }) => ({
  projectOwner: one(project, {
    fields: [componentListener.projectOwnerId],
    references: [project.id],
    relationName: 'componentListener_projectOwner',
  }),

  projectEvent: one(projectEvent, {
    fields: [componentListener.projectEventId],
    references: [projectEvent.id],
    relationName: 'componentListener_projectEvent',
  }),
  projectAction: one(projectAction, {
    fields: [componentListener.projectActionId],
    references: [projectAction.id],
    relationName: 'componentListener_projectAction',
  }),

  componentEvent: one(componentEvent, {
    fields: [componentListener.componentEventId],
    references: [componentEvent.id],
    relationName: 'componentListener_componentEvent',
  }),
  componentAction: one(componentAction, {
    fields: [componentListener.componentActionId],
    references: [componentAction.id],
    relationName: 'componentListener_componentAction',
  }),

  parentComponent: one(component, {
    fields: [componentListener.parentComponentId],
    references: [component.id],
    relationName: 'componentListener_parentComponent',
  }),
}));

export type ComponentListener = typeof componentListener.$inferSelect;
export type NewComponentListener = typeof componentListener.$inferInsert;
export type ComponentListenerUpdate = Partial<typeof componentListener.$inferInsert>;


export const componentContent = pgTable('componentContent', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('componentContent'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  uiNodeId: uuid('uiNodeId').notNull().references(() => uiNode.id, { onDelete: 'cascade' }),
  parentComponentId: uuid('parentComponentId').notNull().references(() => component.id, { onDelete: 'cascade' }),
}, () => [
  check('componentContent__type_is_componentContent', sql`type in ('componentContent')`),
]);
export const componentContentRelations = relations(componentContent, ({ one }) => ({
  projectOwner: one(project, {
    fields: [componentContent.projectOwnerId],
    references: [project.id],
    relationName: 'componentContent_projectOwner',
  }),

  uiNode: one(uiNode, {
    fields: [componentContent.uiNodeId],
    references: [uiNode.id],
    relationName: 'componentContent_uiNode',
  }),

  parentComponent: one(component, {
    fields: [componentContent.parentComponentId],
    references: [component.id],
    relationName: 'componentContent_parentComponent',
  }),
}));

export type ComponentContent = typeof componentContent.$inferSelect;
export type NewComponentContent = typeof componentContent.$inferInsert;
export type ComponentContentUpdate = Partial<typeof componentContent.$inferInsert>;
