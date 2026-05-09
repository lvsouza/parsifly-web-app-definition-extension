import { sql } from 'drizzle-orm';
import { boolean, check, integer, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { expression } from './expression';
import { property } from './property';
import { project } from './project';


export const action = pgTable('action', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull(),
  description: varchar('description'),
  type: varchar('type').notNull().default('action'),
  required: boolean('required').notNull().default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('action')`),
]);

export type Action = typeof action.$inferSelect;
export type NewAction = typeof action.$inferInsert;
export type ActionUpdate = Partial<typeof action.$inferInsert>;


export const actionParameter = pgTable('actionParameter', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('actionParameter'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentActionId: uuid('parentActionId').notNull().references(() => action.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('actionParameter')`),
]);

export type ActionParameter = typeof actionParameter.$inferSelect;
export type NewActionParameter = typeof actionParameter.$inferInsert;
export type ActionParameterUpdate = Partial<typeof actionParameter.$inferInsert>;


export const actionVariable = pgTable('actionVariable', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('actionVariable'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentActionId: uuid('parentActionId').notNull().references(() => action.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('actionVariable')`),
]);

export type ActionVariable = typeof actionVariable.$inferSelect;
export type NewActionVariable = typeof actionVariable.$inferInsert;
export type ActionVariableUpdate = Partial<typeof actionVariable.$inferInsert>;


export const actionOutput = pgTable('actionOutput', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('actionOutput'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentActionId: uuid('parentActionId').notNull().references(() => action.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('actionOutput')`),
]);

export type ActionOutput = typeof actionOutput.$inferSelect;
export type NewActionOutput = typeof actionOutput.$inferInsert;
export type ActionOutputUpdate = Partial<typeof actionOutput.$inferInsert>;


export const actionNodeTypeEnum = pgEnum('enum_action_node_type', ['start', 'end']);

export type TActionNodeType = typeof actionNodeTypeEnum.enumValues[number];

export const actionNode = pgTable('actionNode', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('actionNode'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentActionId: uuid('parentActionId').notNull().references(() => action.id, { onDelete: 'cascade' }),

  top: integer('top').notNull(),
  left: integer('left').notNull(),
  nodeType: actionNodeTypeEnum('nodeType').notNull(),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('actionNode')`),
]);

export type ActionNode = typeof actionNode.$inferSelect;
export type NewActionNode = typeof actionNode.$inferInsert;
export type ActionNodeUpdate = Partial<typeof actionNode.$inferInsert>;


export const actionNodeConnection = pgTable('actionNodeConnection', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('actionNodeConnection'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  fromActionNodeId: uuid('fromActionNodeId').notNull().references(() => actionNode.id, { onDelete: 'cascade' }),
  toActionNodeId: uuid('toActionNodeId').notNull().references(() => actionNode.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('actionNodeConnection')`),
]);

export type ActionNodeConnection = typeof actionNodeConnection.$inferSelect;
export type NewActionNodeConnection = typeof actionNodeConnection.$inferInsert;
export type ActionNodeConnectionUpdate = Partial<typeof actionNodeConnection.$inferInsert>;


export const actionNodePropertyValue = pgTable('actionNodePropertyValue', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('actionNodePropertyValue'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentActionNodeId: uuid('parentActionNodeId').notNull().references(() => actionNode.id, { onDelete: 'cascade' }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  expressionId: uuid('expressionId').notNull().references(() => expression.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('actionNodePropertyValue')`),
]);

export type ActionNodePropertyValue = typeof actionNodePropertyValue.$inferSelect;
export type NewActionNodePropertyValue = typeof actionNodePropertyValue.$inferInsert;
export type ActionNodePropertyValueUpdate = Partial<typeof actionNodePropertyValue.$inferInsert>;
