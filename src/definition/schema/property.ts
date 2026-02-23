import { pgTable, uuid, timestamp, varchar, jsonb, boolean, pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

import { externalActionOutput, externalActionParameter, externalComponentEvent, externalComponentParameter, externalComponentSlot } from './external';
import { actionParameter, actionVariable, actionOutput, actionNodePropertyValue } from './action';
import { structure, structureProperty } from './structure';
import { expressionNodePropertyValue } from './expression';
import { eventParameter } from './event';
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
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name').notNull(),
  type: varchar('type').notNull().default('property'),
  description: varchar('description'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),

  dataType: webAppDataTypeEnum('dataType').notNull().default('string'),

  defaultValue: jsonb('defaultValue'),
  required: boolean('required').notNull().default(false),

  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  parentPropertyId: uuid('parentPropertyId').references((): AnyPgColumn => property.id, { onDelete: 'cascade' }),
  enumReferenceId: uuid('enumReferenceId').references(() => enumTable.id, { onDelete: 'set null' }),
  structureReferenceId: uuid('structureReferenceId').references(() => structure.id, { onDelete: 'set null' }),
})
export const propertyRelations = relations(property, ({ one, many }) => ({
  projectOwner: one(project, {
    references: [project.id],
    fields: [property.projectOwnerId],
    relationName: 'property_projectOwner'
  }),
  parentProperty: one(property, {
    references: [property.id],
    fields: [property.parentPropertyId],
    relationName: 'property_parentProperty'
  }),
  enumReference: one(enumTable, {
    references: [enumTable.id],
    fields: [property.enumReferenceId],
    relationName: 'property_enumReference'
  }),
  structureReference: one(structure, {
    references: [structure.id],
    fields: [property.structureReferenceId],
    relationName: 'property_structureReference'
  }),


  childrenProperties: many(property, {
    relationName: 'property_parentProperty',
  }),

  structureProperty: one(structureProperty, {
    fields: [property.id],
    references: [structureProperty.propertyId],
    relationName: 'structureProperty_property',
  }),

  expressionNodePropertyValues: many(expressionNodePropertyValue, {
    relationName: 'expressionNodePropertyValue_property',
  }),

  actionParameter: one(actionParameter, {
    fields: [property.id],
    references: [actionParameter.propertyId],
    relationName: 'actionParameter_property',
  }),

  actionVariable: one(actionVariable, {
    fields: [property.id],
    references: [actionVariable.propertyId],
    relationName: 'actionVariable_property',
  }),

  actionOutput: one(actionOutput, {
    fields: [property.id],
    references: [actionOutput.propertyId],
    relationName: 'actionOutput_property',
  }),

  eventParameter: one(eventParameter, {
    fields: [property.id],
    references: [eventParameter.propertyId],
    relationName: 'eventParameter_property',
  }),

  actionNodePropertyValues: many(actionNodePropertyValue, {
    relationName: 'actionNodePropertyValue_property',
  }),

  externalActionParameters: many(externalActionParameter, {
    relationName: 'externalActionParameter_property',
  }),

  externalActionOutputs: many(externalActionOutput, {
    relationName: 'externalActionOutput_property',
  }),

  externalComponentParameters: many(externalComponentParameter, {
    relationName: 'externalComponentParameter_property',
  }),

  externalComponentSlots: many(externalComponentSlot, {
    relationName: 'externalComponentSlot_property',
  }),

  externalComponentEvents: many(externalComponentEvent, {
    relationName: 'externalComponentEvent_property',
  }),
}));

export type Property = typeof property.$inferSelect;
export type NewProperty = typeof property.$inferInsert;
export type PropertyUpdate = Partial<typeof property.$inferInsert>;
