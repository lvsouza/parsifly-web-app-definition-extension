import { boolean, check, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { externalAction, externalEvent } from './external';
import { projectAction } from './projectAction';
import { projectEvent } from './projectEvent';
import { property } from './property';
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

export type ComponentAction = typeof componentAction.$inferSelect;
export type NewComponentAction = typeof componentAction.$inferInsert;
export type ComponentActionUpdate = Partial<typeof componentAction.$inferInsert>;


export const componentListener = pgTable('componentListener', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('componentListener'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  projectEventId: uuid('projectEventId').references(() => projectEvent.id, { onDelete: 'cascade' }),
  projectActionId: uuid('projectActionId').references(() => projectAction.id, { onDelete: 'cascade' }),
  externalEventId: uuid('externalEventId').references(() => externalEvent.id, { onDelete: 'cascade' }),
  externalActionId: uuid('externalActionId').references(() => externalAction.id, { onDelete: 'cascade' }),
  componentEventId: uuid('componentEventId').references(() => componentEvent.id, { onDelete: 'cascade' }),
  componentActionId: uuid('componentActionId').references(() => componentAction.id, { onDelete: 'cascade' }),
  parentComponentId: uuid('parentComponentId').notNull().references(() => component.id, { onDelete: 'cascade' }),
}, () => [
  check('componentListener__type_is_componentListener', sql`type in ('componentListener')`),
]);

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

export type ComponentContent = typeof componentContent.$inferSelect;
export type NewComponentContent = typeof componentContent.$inferInsert;
export type ComponentContentUpdate = Partial<typeof componentContent.$inferInsert>;
