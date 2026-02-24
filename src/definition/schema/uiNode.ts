import { check, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

import { componentContent } from './component';
import { expression } from './expression';
import { property } from './property';
import { project } from './project';



export const uiNodeTypeEnum = pgEnum('enum_ui_node_type', ['component', 'if', 'loop', 'slot']);

export type TuiNodeType = typeof uiNodeTypeEnum.enumValues[number];

export const uiNode = pgTable('uiNode', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('uiNode'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  nodeType: uiNodeTypeEnum('nodeType').notNull(),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('uiNode')`),
]);
export const uiNodeRelations = relations(uiNode, ({ one, many }) => ({
  projectOwner: one(project, {
    references: [project.id],
    fields: [uiNode.projectOwnerId],
    relationName: 'uiNode_projectOwner'
  }),

  uiNodePropertyValues: many(uiNodePropertyValue, {
    relationName: 'uiNodePropertyValue_parentUiNode',
  }),

  componentContents: many(componentContent, {
    relationName: 'componentContent_parentUiNode',
  }),
}));

export type UiNodeParameter = typeof uiNode.$inferSelect;
export type NewUiNodeParameter = typeof uiNode.$inferInsert;
export type UiNodeParameterUpdate = Partial<typeof uiNode.$inferInsert>;


export const uiNodePropertyValue = pgTable('uiNodePropertyValue', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('uiNodePropertyValue'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  value: jsonb('value').notNull(),
  parentUiNodeId: uuid('parentUiNodeId').notNull().references(() => uiNode.id, { onDelete: 'cascade' }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  expressionId: uuid('expressionId').notNull().references(() => expression.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('uiNodePropertyValue')`),
]);
export const uiNodePropertyValueRelations = relations(uiNodePropertyValue, ({ one }) => ({
  projectOwner: one(project, {
    references: [project.id],
    fields: [uiNodePropertyValue.projectOwnerId],
    relationName: 'uiNodePropertyValue_projectOwner'
  }),

  parentUiNode: one(uiNode, {
    references: [uiNode.id],
    fields: [uiNodePropertyValue.parentUiNodeId],
    relationName: 'uiNodePropertyValue_parentUiNode'
  }),

  property: one(property, {
    references: [property.id],
    fields: [uiNodePropertyValue.propertyId],
    relationName: 'uiNodePropertyValue_property'
  }),

  expression: one(expression, {
    references: [expression.id],
    fields: [uiNodePropertyValue.expressionId],
    relationName: 'uiNodePropertyValue_expression'
  }),
}));

export type UiNodePropertyValueParameter = typeof uiNodePropertyValue.$inferSelect;
export type NewUiNodePropertyValueParameter = typeof uiNodePropertyValue.$inferInsert;
export type UiNodePropertyValueParameterUpdate = Partial<typeof uiNodePropertyValue.$inferInsert>;
