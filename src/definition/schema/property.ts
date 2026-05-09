import { pgTable, uuid, timestamp, varchar, jsonb, boolean, pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core';

import { structure } from './structure';
import { project } from './project';
import { enumTable } from './enum';


export const webAppDataTypeEnum = pgEnum('enum_web_app_data_type', [
  'enum',
  'structure',

  'string',
  'number',
  'boolean',
  'null',
  'object',
  'binary',

  'array_enum',
  'array_structure',

  'array_string',
  'array_number',
  'array_boolean',
  'array_null',
  'array_object',
  'array_binary',
])

export type TWebAppDataType = typeof webAppDataTypeEnum.enumValues[number]

export const property = pgTable('property', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  type: varchar('type').notNull().default('property'),
  description: varchar('description'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  dataType: webAppDataTypeEnum('dataType').notNull().default('string'),

  defaultValue: jsonb('defaultValue'),
  jsonName: varchar('jsonName').notNull().default(''),
  required: boolean('required').notNull().default(false),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentPropertyId: uuid('parentPropertyId').references((): AnyPgColumn => property.id, { onDelete: 'cascade' }),
  enumReferenceId: uuid('enumReferenceId').references(() => enumTable.id, { onDelete: 'set null' }),
  structureReferenceId: uuid('structureReferenceId').references(() => structure.id, { onDelete: 'set null' }),
})

export type Property = typeof property.$inferSelect;
export type NewProperty = typeof property.$inferInsert;
export type PropertyUpdate = Partial<typeof property.$inferInsert>;
