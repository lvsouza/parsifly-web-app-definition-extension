import { relations, sql } from 'drizzle-orm';
import { boolean, check, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { enumProperty, enumTable, enumValue, enumValueByProperty } from './enum';
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
}))

// Exporte o tipo para uso no frontend
export type Project = typeof project.$inferSelect;
