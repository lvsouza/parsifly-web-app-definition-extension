import { pgTable, uuid, varchar, boolean, timestamp, jsonb, unique, check, pgEnum } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

import { property } from './property'
import { project } from './project'
import { folder } from './folder'


export const webAppBasicDataTypeEnum = pgEnum('enum_web_app_basic_data_type', ['string', 'number', 'boolean', 'null'])

export type TWebAppBasicDataType = typeof webAppBasicDataTypeEnum.enumValues[number]


export const enumTable = pgTable('enum', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull().unique(),
  type: varchar('type').notNull().default('enum'),
  description: varchar('description'),
  public: boolean('public').default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentProjectId: uuid('parentProjectId').references(() => project.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parentFolderId').references(() => folder.id, { onDelete: 'cascade' }),
}, () => [
  check('enum__type_is_enum', sql`type in ('enum')`),
  check('enum__project_or_folder_not_null', sql`(
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  )`),
])
export const enumRelations = relations(enumTable, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [enumTable.projectOwnerId],
    references: [project.id],
    relationName: 'enum_projectOwner',
  }),

  parentProject: one(project, {
    fields: [enumTable.parentProjectId],
    references: [project.id],
    relationName: 'enum_parentProject',
  }),

  parentFolder: one(folder, {
    fields: [enumTable.parentFolderId],
    references: [folder.id],
    relationName: 'enum_parentFolder',
  }),

  properties: many(enumProperty, {
    relationName: 'enumProperty_parentEnum',
  }),

  values: many(enumValue, {
    relationName: 'enumValue_parentEnum',
  }),

  referencedByProperties: many(property, {
    relationName: 'property_enumReference',
  }),
}))

export type Enum = typeof enumTable.$inferSelect;
export type NewEnum = typeof enumTable.$inferInsert;
export type EnumUpdate = Partial<typeof enumTable.$inferInsert>;


export const enumProperty = pgTable('enumProperty', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  type: varchar('type').notNull().default('enumProperty'),
  description: varchar('description'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  dataType: webAppBasicDataTypeEnum('dataType').notNull().default('string'),

  defaultValue: jsonb('defaultValue'),
  jsonName: varchar('jsonName').notNull().default(''),
  required: boolean('required').notNull().default(false),

  parentEnumId: uuid('parentEnumId').notNull().references(() => enumTable.id, { onDelete: 'cascade' }),
}, table => [
  unique('enumProperty__name_parentEnumId').on(table.name, table.parentEnumId),
  check('enumProperty__type_is_enumProperty', sql`type in ('enumProperty')`),
  check('enumProperty__defaultValue_only_for_string_number_boolean', sql`
    "defaultValue" IS NULL OR (
      "dataType"::text IN ('string','number','boolean')
      AND jsonb_typeof("defaultValue") IN ('string','number','boolean')
    )
  `),
])
export const enumPropertyRelations = relations(enumProperty, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [enumProperty.projectOwnerId],
    references: [project.id],
    relationName: 'enumProperty_projectOwner',
  }),

  parentEnum: one(enumTable, {
    fields: [enumProperty.parentEnumId],
    references: [enumTable.id],
    relationName: 'enumProperty_parentEnum',
  }),

  valueProperties: many(enumValueByProperty, {
    relationName: 'enumValueByProperty_parentEnumProperty',
  }),
}))

export type EnumProperty = typeof enumProperty.$inferSelect;
export type NewEnumProperty = typeof enumProperty.$inferInsert;
export type EnumPropertyUpdate = Partial<typeof enumProperty.$inferInsert>;


export const enumValue = pgTable('enumValue', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar('name').notNull(),
  type: varchar('type').notNull().default('enumValue'),

  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentEnumId: uuid('parentEnumId').notNull().references(() => enumTable.id, { onDelete: 'cascade' }),
}, (table) => [
  unique('enumValue__name_parentEnumId').on(table.name, table.parentEnumId),
  check('enumValue__type_is_enumValue', sql`type in ('enumValue')`),
])
export const enumValueRelations = relations(enumValue, ({ one, many }) => ({
  projectOwner: one(project, {
    fields: [enumValue.projectOwnerId],
    references: [project.id],
    relationName: 'enumValue_projectOwner',
  }),

  parentEnum: one(enumTable, {
    fields: [enumValue.parentEnumId],
    references: [enumTable.id],
    relationName: 'enumValue_parentEnum',
  }),

  propertyValues: many(enumValueByProperty, {
    relationName: 'enumValueByProperty_parentEnumValue',
  }),
}))

export type EnumValue = typeof enumValue.$inferSelect;
export type NewEnumValue = typeof enumValue.$inferInsert;
export type EnumValueUpdate = Partial<typeof enumValue.$inferInsert>;


export const enumValueByProperty = pgTable('enumValueByProperty', {
  id: uuid('id').primaryKey().defaultRandom(),

  type: varchar('type').notNull().default('enumValueByProperty'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  value: jsonb('value'),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentEnumValueId: uuid('parentEnumValueId').notNull().references(() => enumValue.id, { onDelete: 'cascade' }),
  parentEnumPropertyId: uuid('parentEnumPropertyId').notNull().references(() => enumProperty.id, { onDelete: 'cascade' }),
}, table => [
  unique('enumValueByProperty__parentEnumValueId_parentEnumPropertyId').on(table.parentEnumValueId, table.parentEnumPropertyId),

  check('enumValueByProperty__type_in_enumValueByProperty', sql`type in ('enumValueByProperty')`),
  // CHECK: value só pode existir para string, number e boolean
  check('enumValueByProperty__value_only_for_string_number_boolean', sql`
    "value" IS NULL
    OR jsonb_typeof("value") IN ('string','number','boolean')
  `),
])
export const enumValueByPropertyRelations = relations(enumValueByProperty, ({ one }) => ({
  projectOwner: one(project, {
    fields: [enumValueByProperty.projectOwnerId],
    references: [project.id],
    relationName: 'enumValueByProperty_projectOwner',
  }),

  parentEnumValue: one(enumValue, {
    fields: [enumValueByProperty.parentEnumValueId],
    references: [enumValue.id],
    relationName: 'enumValueByProperty_parentEnumValue',
  }),

  parentEnumProperty: one(enumProperty, {
    fields: [enumValueByProperty.parentEnumPropertyId],
    references: [enumProperty.id],
    relationName: 'enumValueByProperty_parentEnumProperty',
  }),
}))

export type EnumValueByProperty = typeof enumValueByProperty.$inferSelect;
export type NewEnumValueByProperty = typeof enumValueByProperty.$inferInsert;
export type EnumValueByPropertyUpdate = Partial<typeof enumValueByProperty.$inferInsert>;
