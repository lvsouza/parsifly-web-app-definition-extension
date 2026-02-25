import { relations, sql } from 'drizzle-orm';
import { boolean, check, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { external, externalAction, externalActionOutput, externalActionParameter, externalComponent, externalComponentEvent, externalComponentParameter, externalComponentSlot, externalEvent, externalVariable } from './external';
import { component, componentAction, componentContent, componentEvent, componentListener, componentParameter, componentVariable } from './component';
import { action, actionParameter, actionVariable, actionOutput, actionNode, actionNodeConnection, actionNodePropertyValue } from './action';
import { page, pageAction, pageContent, pageListener, pageParameter, pageVariable } from './page';
import { enumProperty, enumTable, enumValue, enumValueByProperty } from './enum';
import { expression, expressionNode } from './expression';
import { uiNode, uiNodePropertyValue } from './uiNode';
import { projectVariable } from './projectVariable';
import { projectListener } from './projectListener';
import { projectAction } from './projectAction';
import { event, eventParameter } from './event';
import { projectEvent } from './projectEvent';
import { router, routerNode } from './router';
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

  // Externals
  ownedExternals: many(external, {
    relationName: 'external_projectOwner',
  }),
  rootExternals: many(external, {
    relationName: 'external_parentProject',
  }),
  ownedExternalEvents: many(externalEvent, {
    relationName: 'externalEvent_projectOwner',
  }),
  ownedExternalVariables: many(externalVariable, {
    relationName: 'externalVariable_projectOwner',
  }),
  ownedExternalActions: many(externalAction, {
    relationName: 'externalAction_projectOwner',
  }),
  ownedExternalActionParameters: many(externalActionParameter, {
    relationName: 'externalActionParameter_projectOwner',
  }),
  ownedExternalActionOutputs: many(externalActionOutput, {
    relationName: 'externalActionOutput_projectOwner',
  }),
  ownedExternalComponents: many(externalComponent, {
    relationName: 'externalComponent_projectOwner',
  }),
  ownedExternalComponentParameters: many(externalComponentParameter, {
    relationName: 'externalComponentParameter_projectOwner',
  }),
  ownedExternalComponentSlots: many(externalComponentSlot, {
    relationName: 'externalComponentSlot_projectOwner',
  }),
  ownedExternalComponentEvents: many(externalComponentEvent, {
    relationName: 'externalComponentEvent_projectOwner',
  }),

  // ProjectVariable
  ownedProjectVariables: many(projectVariable, {
    relationName: 'projectVariable_projectOwner',
  }),
  rootProjectVariables: many(projectVariable, {
    relationName: 'projectVariable_parentProject',
  }),

  // ProjectVariable
  ownedProjectActions: many(projectAction, {
    relationName: 'projectAction_projectOwner',
  }),
  rootProjectActions: many(projectAction, {
    relationName: 'projectAction_parentProject',
  }),

  // ProjectEvent
  ownedProjectEvents: many(projectEvent, {
    relationName: 'projectEvent_projectOwner',
  }),
  rootProjectEvents: many(projectEvent, {
    relationName: 'projectEvent_parentProject',
  }),

  // ProjectListener
  ownedProjectListeners: many(projectListener, {
    relationName: 'projectListener_projectOwner',
  }),
  rootProjectListeners: many(projectListener, {
    relationName: 'projectListener_parentProject',
  }),

  // Component
  ownedComponents: many(component, {
    relationName: 'component_projectOwner',
  }),
  rootComponents: many(component, {
    relationName: 'component_parentProject',
  }),
  ownedComponentParameters: many(componentParameter, {
    relationName: 'componentParameter_projectOwner',
  }),
  ownedComponentVariables: many(componentVariable, {
    relationName: 'componentVariable_projectOwner',
  }),
  ownedComponentActions: many(componentAction, {
    relationName: 'componentAction_projectOwner',
  }),
  ownedComponentEvents: many(componentEvent, {
    relationName: 'componentEvent_projectOwner',
  }),
  ownedComponentListeners: many(componentListener, {
    relationName: 'componentListener_projectOwner',
  }),
  ownedComponentContents: many(componentContent, {
    relationName: 'componentContent_projectOwner',
  }),

  // Page
  ownedPages: many(page, {
    relationName: 'page_projectOwner',
  }),
  rootPages: many(page, {
    relationName: 'page_parentProject',
  }),
  ownedPageParameters: many(pageParameter, {
    relationName: 'pageParameter_projectOwner',
  }),
  ownedPageVariables: many(pageVariable, {
    relationName: 'pageVariable_projectOwner',
  }),
  ownedPageActions: many(pageAction, {
    relationName: 'pageAction_projectOwner',
  }),
  ownedPageListeners: many(pageListener, {
    relationName: 'pageListener_projectOwner',
  }),
  ownedPageContents: many(pageContent, {
    relationName: 'pageContent_projectOwner',
  }),

  // Router
  ownedRouters: many(router, {
    relationName: 'router_projectOwner',
  }),
  rootRouters: many(router, {
    relationName: 'router_parentProject',
  }),
  ownedRouterNodes: many(routerNode, {
    relationName: 'routerNode_projectOwner',
  }),
}));

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
export type ProjectUpdate = Partial<typeof project.$inferInsert>;
