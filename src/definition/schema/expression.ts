import { check, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

import { property } from './property';
import { project } from './project';
import { uiNodePropertyValue } from './uiNode';


export const expression = pgTable('expression', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('expression'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('expression')`),
]);
export const expressionRelations = relations(expression, ({ one, many }) => ({
  projectOwner: one(project, {
    references: [project.id],
    fields: [expression.projectOwnerId],
    relationName: 'expression_projectOwner'
  }),

  expressionNodes: many(expressionNode, {
    relationName: 'expressionNode_parentExpression',
  }),

  uiNodePropertyValues: many(uiNodePropertyValue, {
    relationName: 'uiNodePropertyValue_expression',
  }),
}));

export type Expression = typeof expression.$inferSelect;
export type NewExpression = typeof expression.$inferInsert;
export type ExpressionUpdate = Partial<typeof expression.$inferInsert>;


export const expressionNodeTypeEnum = pgEnum('enum_expression_node_type', ['start', 'end']);

export type TExpressionNodeType = typeof expressionNodeTypeEnum.enumValues[number];

export const expressionNode = pgTable('expressionNode', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('expressionNode'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  nodeType: expressionNodeTypeEnum('nodeType').notNull(),
  parentExpressionId: uuid('parentExpressionId').notNull().references(() => expression.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('expressionNode')`),
]);
export const expressionNodeRelations = relations(expressionNode, ({ one, many }) => ({
  projectOwner: one(project, {
    references: [project.id],
    fields: [expressionNode.projectOwnerId],
    relationName: 'expressionNode_projectOwner'
  }),

  parentExpression: one(expression, {
    references: [expression.id],
    fields: [expressionNode.parentExpressionId],
    relationName: 'expressionNode_parentExpression'
  }),

  expressionNodePropertyValues: many(expressionNodePropertyValue, {
    relationName: 'expressionNodePropertyValue_parentExpressionNode',
  }),
}));

export type ExpressionNode = typeof expressionNode.$inferSelect;
export type NewExpressionNode = typeof expressionNode.$inferInsert;
export type ExpressionNodeUpdate = Partial<typeof expressionNode.$inferInsert>;


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
export const expressionNodePropertyValueRelations = relations(expressionNodePropertyValue, ({ one }) => ({
  projectOwner: one(project, {
    references: [project.id],
    fields: [expressionNodePropertyValue.projectOwnerId],
    relationName: 'expressionNodePropertyValue_projectOwner'
  }),

  parentExpressionNode: one(expressionNode, {
    references: [expressionNode.id],
    fields: [expressionNodePropertyValue.parentExpressionNodeId],
    relationName: 'expressionNodePropertyValue_parentExpressionNode'
  }),

  property: one(property, {
    references: [property.id],
    fields: [expressionNodePropertyValue.propertyId],
    relationName: 'expressionNodePropertyValue_property'
  }),
}));

export type ExpressionNodePropertyValue = typeof expressionNodePropertyValue.$inferSelect;
export type NewExpressionNodePropertyValue = typeof expressionNodePropertyValue.$inferInsert;
export type ExpressionNodePropertyValueUpdate = Partial<typeof expressionNodePropertyValue.$inferInsert>;
