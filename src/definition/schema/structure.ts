import { sql } from 'drizzle-orm'
import { pgTable, uuid, varchar, boolean, timestamp, check } from 'drizzle-orm/pg-core'

import { property } from './property'
import { project } from './project'
import { folder } from './folder'


export const structure = pgTable('structure', {
  id: uuid('id').primaryKey().defaultRandom(),
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

export type Structure = typeof structure.$inferSelect;
export type NewStructure = typeof structure.$inferInsert;
export type StructureUpdate = Partial<typeof structure.$inferInsert>;

export const structureProperty = pgTable('structureProperty', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type').notNull().default('structureProperty'),
  structureId: uuid('structureId').notNull().references(() => structure.id, { onDelete: 'restrict' /* Restringe porque não consegue propagar o cascade para o property */ }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
}, () => [
  check('structureProperty__type_is_structureProperty', sql`type in ('structureProperty')`),
])

export type StructureProperty = typeof structureProperty.$inferSelect;
export type NewStructureProperty = typeof structureProperty.$inferInsert;
export type StructurePropertyUpdate = Partial<typeof structureProperty.$inferInsert>;
