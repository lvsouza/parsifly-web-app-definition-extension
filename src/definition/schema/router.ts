import { pgTable, varchar, uuid, timestamp, check, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

import { expression } from './expression';
import { project } from './project';
import { page } from './page';


export const router = pgTable('router', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('router'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
}, () => [
  check('router__type_is_router', sql`type in ('router')`),
]);
export const routerRelations = relations(router, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [router.projectOwnerId],
    references: [project.id],
    relationName: 'router_projectOwner',
  }),

  parentProject: one(project, {
    fields: [router.parentProjectId],
    references: [project.id],
    relationName: 'router_parentProject',
  }),

  routerNodes: many(routerNode, {
    relationName: 'routerNode_parentRouter',
  }),
}));

export type Router = typeof router.$inferSelect;
export type NewRouter = typeof router.$inferInsert;
export type RouterUpdate = Partial<typeof router.$inferInsert>;


export const routerNodeTypeEnum = pgEnum('enum_router_node_type', ['page', 'redirect', 'condition']);

export type TRouterNodeType = typeof routerNodeTypeEnum.enumValues[number];

export const routerNode = pgTable('routerNode', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('routerNode'),
  path: varchar('path'),
  nodeType: routerNodeTypeEnum('nodeType').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),

  pageId: uuid('pageId').references(() => page.id, { onDelete: 'cascade' }),
  redirectRouterNodeId: uuid('redirectRouterNodeId').references((): any => routerNode.id, { onDelete: 'cascade' }),
  conditionExpressionId: uuid('conditionExpressionId').references(() => expression.id, { onDelete: 'cascade' }),

  parentNodeId: uuid('parentNodeId').references((): any => routerNode.id, { onDelete: 'cascade' }),
  parentRouterId: uuid('parentRouterId').notNull().references(() => router.id, { onDelete: 'cascade' }),
}, () => [
  check('routerNode__type_is_routerNode', sql`type in ('routerNode')`),
]);
export const routerNodeRelations = relations(routerNode, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [routerNode.projectOwnerId],
    references: [project.id],
    relationName: 'routerNode_projectOwner',
  }),

  parentRouter: one(router, {
    fields: [routerNode.parentRouterId],
    references: [router.id],
    relationName: 'routerNode_parentRouter',
  }),

  page: one(page, {
    fields: [routerNode.pageId],
    references: [page.id],
    relationName: 'routerNode_page',
  }),

  redirectRouterNode: one(routerNode, {
    fields: [routerNode.redirectRouterNodeId],
    references: [routerNode.id],
    relationName: 'routerNode_redirectRouterNode',
  }),

  parentNode: one(routerNode, {
    fields: [routerNode.parentNodeId],
    references: [routerNode.id],
    relationName: 'routerNode_parentNode',
  }),

  children: many(routerNode, {
    relationName: 'routerNode_parentNode',
  }),

  redirectRouterNodes: many(routerNode, {
    relationName: 'routerNode_redirectRouterNode',
  }),
}));

export type RouterNode = typeof routerNode.$inferSelect;
export type NewRouterNode = typeof routerNode.$inferInsert;
export type RouterNodeUpdate = Partial<typeof routerNode.$inferInsert>;
