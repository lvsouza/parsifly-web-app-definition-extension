import { relations, sql } from 'drizzle-orm';
import { boolean, check, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { property } from './property';
import { project } from './project';
import { folder } from './folder';
import { event } from './event';


export const external = pgTable('external', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),

  name: varchar('name').notNull().unique(),
  description: varchar('description'),
  public: boolean('public').notNull().default(false),
  type: varchar('type').notNull().default('external'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  source: varchar('source').notNull().default('// source code here...'),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),
}, (table) => [
  check('external_type_check', sql`${table.type} in ('external')`),
  check('external_project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
]);
export const externalRelations = relations(external, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [external.projectOwnerId],
    references: [project.id],
    relationName: 'external_projectOwner',
  }),
  parentFolder: one(folder, {
    fields: [external.parentFolderId],
    references: [folder.id],
    relationName: 'external_parentFolder',
  }),
  parentProject: one(project, {
    fields: [external.parentProjectId],
    references: [project.id],
    relationName: 'external_parentProject',
  }),

  externalEvents: many(externalEvent, {
    relationName: 'externalEvent_external',
  }),

  externalVariables: many(externalVariable, {
    relationName: 'externalVariable_external',
  }),

  externalActions: many(externalAction, {
    relationName: 'externalAction_external',
  }),

  externalComponents: many(externalComponent, {
    relationName: 'externalComponent_external',
  }),
}));

export type External = typeof external.$inferSelect;
export type NewExternal = typeof external.$inferInsert;
export type ExternalUpdate = Partial<typeof external.$inferInsert>;


export const externalEvent = pgTable('externalEvent', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('externalEvent'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  public: boolean('public').notNull().default(false),
  sourceName: varchar('sourceName').notNull().default(''),
  eventId: uuid('eventId').notNull().references(() => event.id, { onDelete: 'cascade' }),
  parentExternalId: uuid('parentExternalId').notNull().references(() => external.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalEvent_type_check', sql`${table.type} in ('externalEvent')`),
]);
export const externalEventRelations = relations(externalEvent, ({ one }) => ({
  projectOwner: one(project, {
    fields: [externalEvent.projectOwnerId],
    references: [project.id],
    relationName: 'externalEvent_projectOwner',
  }),

  parentExternal: one(external, {
    fields: [externalEvent.parentExternalId],
    references: [external.id],
    relationName: 'externalEvent_external',
  }),

  event: one(event, {
    fields: [externalEvent.parentExternalId],
    references: [event.id],
    relationName: 'externalEvent_event',
  }),
}));

export type ExternalEvent = typeof externalEvent.$inferSelect;
export type NewExternalEvent = typeof externalEvent.$inferInsert;
export type ExternalEventUpdate = Partial<typeof externalEvent.$inferInsert>;


export const externalVariable = pgTable('externalVariable', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('externalVariable'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  public: boolean('public').notNull().default(false),
  sourceName: varchar('sourceName').notNull().default(''),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentExternalId: uuid('parentExternalId').notNull().references(() => external.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalVariable_type_check', sql`${table.type} in ('externalVariable')`),
]);
export const externalVariableRelations = relations(externalVariable, ({ one }) => ({
  projectOwner: one(project, {
    fields: [externalVariable.projectOwnerId],
    references: [project.id],
    relationName: 'externalVariable_projectOwner',
  }),

  parentExternal: one(external, {
    fields: [externalVariable.parentExternalId],
    references: [external.id],
    relationName: 'externalVariable_external',
  }),

  property: one(property, {
    fields: [externalVariable.parentExternalId],
    references: [property.id],
    relationName: 'externalVariable_property',
  }),
}));

export type ExternalVariable = typeof externalVariable.$inferSelect;
export type NewExternalVariable = typeof externalVariable.$inferInsert;
export type ExternalVariableUpdate = Partial<typeof externalVariable.$inferInsert>;


export const externalAction = pgTable('externalAction', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  description: varchar('description'),
  type: varchar('type').notNull().default('externalAction'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  public: boolean('public').notNull().default(false),
  sourceName: varchar('sourceName').notNull().default(''),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentExternalId: uuid('parentExternalId').notNull().references(() => external.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalAction_type_check', sql`${table.type} in ('externalAction')`),
]);
export const externalActionRelations = relations(externalAction, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [externalAction.projectOwnerId],
    references: [project.id],
    relationName: 'externalAction_projectOwner',
  }),

  parentExternal: one(external, {
    fields: [externalAction.parentExternalId],
    references: [external.id],
    relationName: 'externalAction_external',
  }),

  parameters: many(externalActionParameter, {
    relationName: 'externalActionParameter_externalAction',
  }),

  outputs: many(externalActionOutput, {
    relationName: 'externalActionOutput_externalAction',
  }),
}));

export type ExternalAction = typeof externalAction.$inferSelect;
export type NewExternalAction = typeof externalAction.$inferInsert;
export type ExternalActionUpdate = Partial<typeof externalAction.$inferInsert>;


export const externalActionParameter = pgTable('externalActionParameter', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('externalActionParameter'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentExternalActionId: uuid('parentExternalActionId').notNull().references(() => externalAction.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalActionParameter_type_check', sql`${table.type} in ('externalActionParameter')`),
]);
export const externalActionParameterRelations = relations(externalActionParameter, ({ one }) => ({
  projectOwner: one(project, {
    fields: [externalActionParameter.projectOwnerId],
    references: [project.id],
    relationName: 'externalActionParameter_projectOwner',
  }),

  property: one(property, {
    fields: [externalActionParameter.propertyId],
    references: [property.id],
    relationName: 'externalActionParameter_property',
  }),

  parentExternalAction: one(externalAction, {
    fields: [externalActionParameter.parentExternalActionId],
    references: [externalAction.id],
    relationName: 'externalActionParameter_externalAction',
  }),
}));

export type ExternalActionParameter = typeof externalActionParameter.$inferSelect;
export type NewExternalActionParameter = typeof externalActionParameter.$inferInsert;
export type ExternalActionParameterUpdate = Partial<typeof externalActionParameter.$inferInsert>;


export const externalActionOutput = pgTable('externalActionOutput', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('externalActionOutput'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentExternalActionId: uuid('parentExternalActionId').notNull().references(() => externalAction.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalActionOutput_type_check', sql`${table.type} in ('externalActionOutput')`),
]);
export const externalActionOutputRelations = relations(externalActionOutput, ({ one }) => ({
  projectOwner: one(project, {
    fields: [externalActionOutput.projectOwnerId],
    references: [project.id],
    relationName: 'externalActionOutput_projectOwner',
  }),

  property: one(property, {
    fields: [externalActionOutput.propertyId],
    references: [property.id],
    relationName: 'externalActionOutput_property',
  }),

  parentExternalAction: one(externalAction, {
    fields: [externalActionOutput.parentExternalActionId],
    references: [externalAction.id],
    relationName: 'externalActionOutput_externalAction',
  }),
}));

export type ExternalActionOutput = typeof externalActionOutput.$inferSelect;
export type NewExternalActionOutput = typeof externalActionOutput.$inferInsert;
export type ExternalActionOutputUpdate = Partial<typeof externalActionOutput.$inferInsert>;


export const externalComponent = pgTable('externalComponent', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  description: varchar('description'),
  type: varchar('type').notNull().default('externalComponent'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  public: boolean('public').notNull().default(false),
  sourceName: varchar('sourceName').notNull().default(''),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentExternalId: uuid('parentExternalId').notNull().references(() => external.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalComponent_type_check', sql`${table.type} in ('externalComponent')`),
]);
export const externalComponentRelations = relations(externalComponent, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [externalComponent.projectOwnerId],
    references: [project.id],
    relationName: 'externalComponent_projectOwner',
  }),

  parentExternal: one(external, {
    fields: [externalComponent.parentExternalId],
    references: [external.id],
    relationName: 'externalComponent_external',
  }),

  parameters: many(externalComponentParameter, {
    relationName: 'externalComponentParameter_externalComponent',
  }),

  slots: many(externalComponentSlot, {
    relationName: 'externalComponentSlot_externalComponent',
  }),

  events: many(externalComponentEvent, {
    relationName: 'externalComponentEvent_externalComponent',
  }),
}));

export type ExternalComponent = typeof externalComponent.$inferSelect;
export type NewExternalComponent = typeof externalComponent.$inferInsert;
export type ExternalComponentUpdate = Partial<typeof externalComponent.$inferInsert>;


export const externalComponentParameter = pgTable('externalComponentParameter', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('externalComponentParameter'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentExternalComponentId: uuid('parentExternalComponentId').notNull().references(() => externalComponent.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalComponentParameter_type_check', sql`${table.type} in ('externalComponentParameter')`),
]);
export const externalComponentParameterRelations = relations(externalComponentParameter, ({ one }) => ({
  projectOwner: one(project, {
    fields: [externalComponentParameter.projectOwnerId],
    references: [project.id],
    relationName: 'externalComponentParameter_projectOwner',
  }),

  property: one(property, {
    fields: [externalComponentParameter.propertyId],
    references: [property.id],
    relationName: 'externalComponentParameter_property',
  }),

  parentExternalComponent: one(externalComponent, {
    fields: [externalComponentParameter.parentExternalComponentId],
    references: [externalComponent.id],
    relationName: 'externalComponentParameter_externalComponent',
  }),
}));

export type ExternalComponentParameter = typeof externalComponentParameter.$inferSelect;
export type NewExternalComponentParameter = typeof externalComponentParameter.$inferInsert;
export type ExternalComponentParameterUpdate = Partial<typeof externalComponentParameter.$inferInsert>;


export const externalComponentSlot = pgTable('externalComponentSlot', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('externalComponentSlot'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentExternalComponentId: uuid('parentExternalComponentId').notNull().references(() => externalComponent.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalComponentSlot_type_check', sql`${table.type} in ('externalComponentSlot')`),
]);
export const externalComponentSlotRelations = relations(externalComponentSlot, ({ one }) => ({
  projectOwner: one(project, {
    fields: [externalComponentSlot.projectOwnerId],
    references: [project.id],
    relationName: 'externalComponentSlot_projectOwner',
  }),

  property: one(property, {
    fields: [externalComponentSlot.propertyId],
    references: [property.id],
    relationName: 'externalComponentSlot_property',
  }),

  parentExternalComponent: one(externalComponent, {
    fields: [externalComponentSlot.parentExternalComponentId],
    references: [externalComponent.id],
    relationName: 'externalComponentSlot_externalComponent',
  }),
}));

export type ExternalComponentSlot = typeof externalComponentSlot.$inferSelect;
export type NewExternalComponentSlot = typeof externalComponentSlot.$inferInsert;
export type ExternalComponentSlotUpdate = Partial<typeof externalComponentSlot.$inferInsert>;


export const externalComponentEvent = pgTable('externalComponentEvent', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('externalComponentEvent'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  eventId: uuid('eventId').notNull().references(() => event.id, { onDelete: 'cascade' }),
  parentExternalComponentId: uuid('parentExternalComponentId').notNull().references(() => externalComponent.id, { onDelete: 'cascade' }),
}, (table) => [
  check('externalComponentEvent_type_check', sql`${table.type} in ('externalComponentEvent')`),
]);
export const externalComponentEventRelations = relations(externalComponentEvent, ({ one }) => ({
  projectOwner: one(project, {
    fields: [externalComponentEvent.projectOwnerId],
    references: [project.id],
    relationName: 'externalComponentEvent_projectOwner',
  }),

  event: one(event, {
    fields: [externalComponentEvent.eventId],
    references: [event.id],
    relationName: 'externalComponentEvent_event',
  }),

  parentExternalComponent: one(externalComponent, {
    fields: [externalComponentEvent.parentExternalComponentId],
    references: [externalComponent.id],
    relationName: 'externalComponentEvent_externalComponent',
  }),
}));

export type ExternalComponentEvent = typeof externalComponentEvent.$inferSelect;
export type NewExternalComponentEvent = typeof externalComponentEvent.$inferInsert;
export type ExternalComponentEventUpdate = Partial<typeof externalComponentEvent.$inferInsert>;
