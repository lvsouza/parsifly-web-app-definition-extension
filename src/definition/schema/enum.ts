import { sql } from 'drizzle-orm'
import { pgTable, uuid, varchar, boolean, timestamp, jsonb, unique, check, pgEnum } from 'drizzle-orm/pg-core'

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

export type EnumValueByProperty = typeof enumValueByProperty.$inferSelect;
export type NewEnumValueByProperty = typeof enumValueByProperty.$inferInsert;
export type EnumValueByPropertyUpdate = Partial<typeof enumValueByProperty.$inferInsert>;
