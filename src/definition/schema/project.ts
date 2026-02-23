import { relations, sql } from 'drizzle-orm';
import { boolean, check, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { action, actionParameter, actionVariable, actionOutput, actionNode, actionNodeConnection, actionNodePropertyValue } from './action';
import { enumProperty, enumTable, enumValue, enumValueByProperty } from './enum';
import { expression, expressionNode } from './expression';
import { uiNode, uiNodePropertyValue } from './uiNode';
import { event, eventParameter } from './event';
import { structure } from './structure';
import { property } from './property';
import { folder } from './folder';


export const project = pgTable('project', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('project'),
  projectType: varchar('projectType').notNull().default('webApp'),
  definitionVersion: integer('definitionVersion').notNull().default(1),
  description: varchar('description'),
  version: varchar('version').default('1.0.0'),
  public: boolean('public').default(false),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('project')`),
  check('project_type_check', sql`${table.projectType} in ('webApp')`),
  check('def_version_check', sql`${table.definitionVersion} in (1)`),
]);
export const projectRelations = relations(project, ({ many }) => ({

  // Folder
  ownedFolders: many(folder, {
    relationName: 'folder_projectOwner',
  }),
  rootFolders: many(folder, {
    relationName: 'folder_parentProject',
  }),

  // Enum
  ownedEnums: many(enumTable, {
    relationName: 'enum_projectOwner',
  }),
  ownedEnumProperties: many(enumProperty, {
    relationName: 'enumProperty_projectOwner',
  }),
  ownedEnumValues: many(enumValue, {
    relationName: 'enumValue_projectOwner',
  }),
  ownedEnumValuesByProperty: many(enumValueByProperty, {
    relationName: 'enumValueByProperty_projectOwner',
  }),

  rootEnums: many(enumTable, {
    relationName: 'enum_parentProject',
  }),

  // Properties
  ownedProperties: many(property, {
    relationName: 'property_projectOwner',
  }),

  // Structure
  ownedStructures: many(structure, {
    relationName: 'structure_projectOwner',
  }),
  rootStructures: many(structure, {
    relationName: 'structure_parentProject',
  }),

  // Expressions
  expressions: many(expression, {
    relationName: 'expression_projectOwner',
  }),
  expressionNodes: many(expressionNode, {
    relationName: 'expressionNode_projectOwner',
  }),
  expressionNodePropertyValues: many(actionNodePropertyValue, {
    relationName: 'expressionNodePropertyValue_projectOwner',
  }),


  // Actions
  ownedActions: many(action, {
    relationName: 'action_projectOwner',
  }),
  ownedActionParameters: many(actionParameter, {
    relationName: 'actionParameter_projectOwner',
  }),
  ownedActionVariables: many(actionVariable, {
    relationName: 'actionVariable_projectOwner',
  }),
  ownedActionOutputs: many(actionOutput, {
    relationName: 'actionOutput_projectOwner',
  }),
  ownedActionNodes: many(actionNode, {
    relationName: 'actionNode_projectOwner',
  }),
  ownedActionNodeConnections: many(actionNodeConnection, {
    relationName: 'actionNodeConnection_projectOwner',
  }),
  ownedActionNodePropertyValues: many(actionNodePropertyValue, {
    relationName: 'actionNodePropertyValue_projectOwner',
  }),

  // UI Nodes
  ownedUiNodes: many(uiNode, {
    relationName: 'uiNode_projectOwner',
  }),
  ownedUiNodePropertyValues: many(uiNodePropertyValue, {
    relationName: 'uiNodePropertyValue_projectOwner',
  }),

  // Events
  ownedEvents: many(event, {
    relationName: 'event_projectOwner',
  }),
  ownedEventParameters: many(eventParameter, {
    relationName: 'eventParameter_projectOwner',
  }),
}))

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
export type ProjectUpdate = Partial<typeof project.$inferInsert>;
