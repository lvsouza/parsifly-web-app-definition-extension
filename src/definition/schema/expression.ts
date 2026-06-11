import { sql } from 'drizzle-orm';
import { check, integer, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { property } from './property';
import { project } from './project';


export const expression = pgTable('expression', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('expression'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('expression')`),
]);

export type Expression = typeof expression.$inferSelect;
export type NewExpression = typeof expression.$inferInsert;
export type ExpressionUpdate = Partial<typeof expression.$inferInsert>;


export const expressionNodeTypeEnum = pgEnum('enum_expression_node_type', [
  'if',
  'output',
  'inputString',
  'inputNumber',
  'inputBoolean',
  'inputBinary',
  'inputGetVariable',
  'inputCallAction',
]);

export type TExpressionNodeType = typeof expressionNodeTypeEnum.enumValues[number];

export const expressionNode = pgTable('expressionNode', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('expressionNode'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  top: integer('top').notNull(),
  left: integer('left').notNull(),
  nodeType: expressionNodeTypeEnum('nodeType').notNull(),
  parentExpressionId: uuid('parentExpressionId').notNull().references(() => expression.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('expressionNode')`),
]);

export type ExpressionNode = typeof expressionNode.$inferSelect;
export type NewExpressionNode = typeof expressionNode.$inferInsert;
export type ExpressionNodeUpdate = Partial<typeof expressionNode.$inferInsert>;


export const expressionNodeConnection = pgTable('expressionNodeConnection', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('expressionNodeConnection'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  fromExpressionNodeId: uuid('fromExpressionNodeId').notNull().references(() => expressionNode.id, { onDelete: 'cascade' }),
  toExpressionNodeId: uuid('toExpressionNodeId').notNull().references(() => expressionNode.id, { onDelete: 'cascade' }),
  fromHandleId: varchar('fromHandleId').notNull().default(''),
  toHandleId: varchar('toHandleId').notNull().default(''),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('expressionNodeConnection')`),
]);

export type ExpressionNodeConnection = typeof expressionNodeConnection.$inferSelect;
export type NewExpressionNodeConnection = typeof expressionNodeConnection.$inferInsert;
export type ExpressionNodeConnectionUpdate = Partial<typeof expressionNodeConnection.$inferInsert>;


export const expressionNodePropertyValue = pgTable('expressionNodePropertyValue', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('expressionNodePropertyValue'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  value: jsonb('value').notNull(),
  parentExpressionNodeId: uuid('parentExpressionNodeId').notNull().references(() => expression.id, { onDelete: 'cascade' }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('expressionNodePropertyValue')`),
]);

export type ExpressionNodePropertyValue = typeof expressionNodePropertyValue.$inferSelect;
export type NewExpressionNodePropertyValue = typeof expressionNodePropertyValue.$inferInsert;
export type ExpressionNodePropertyValueUpdate = Partial<typeof expressionNodePropertyValue.$inferInsert>;
