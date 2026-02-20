import { pgTable, uuid, varchar, boolean, timestamp, check } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

import { property } from './property'
import { project } from './project'
import { folder } from './folder'


export const structure = pgTable('structure', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('structure'),
  description: varchar('description'),
  public: boolean('public').default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),
}, () => [
  check('structure__type_is_structure', sql`type in ('structure')`),
  check('structure__project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
])
export const structureRelations = relations(structure, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [structure.projectOwnerId],
    references: [project.id],
    relationName: 'structure_projectOwner',
  }),

  parentProject: one(project, {
    fields: [structure.parentProjectId],
    references: [project.id],
    relationName: 'structure_parentProject',
  }),

  parentFolder: one(folder, {
    fields: [structure.parentFolderId],
    references: [folder.id],
    relationName: 'structure_parentFolder',
  }),

  referencedByProperties: many(property, {
    relationName: 'property_structureReference',
  }),

  structureProperties: many(structureProperty, {
    relationName: 'structureProperty_structure',
  }),
}))

export type Structure = typeof structure.$inferSelect;
export type NewStructure = typeof structure.$inferInsert;
export type StructureUpdate = Partial<typeof structure.$inferInsert>;

export const structureProperty = pgTable('structureProperty', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  type: varchar('type').notNull().default('structureProperty'),
  structureId: uuid('structureId').notNull().references(() => structure.id, { onDelete: 'restrict' /* Restringe porque não consegue propagar o cascade para o property */ }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
}, () => [
  check('structureProperty__type_is_structureProperty', sql`type in ('structureProperty')`),
])
export const structurePropertyRelations = relations(structureProperty, ({ one }) => ({
  structure: one(structure, {
    fields: [structureProperty.structureId],
    references: [structure.id],
    relationName: 'structureProperty_structure',
  }),

  property: one(property, {
    fields: [structureProperty.propertyId],
    references: [property.id],
    relationName: 'structureProperty_property',
  }),
}))

export type StructureProperty = typeof structureProperty.$inferSelect;
export type NewStructureProperty = typeof structureProperty.$inferInsert;
export type StructurePropertyUpdate = Partial<typeof structureProperty.$inferInsert>;
