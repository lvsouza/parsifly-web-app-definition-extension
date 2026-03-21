import { relations, sql } from 'drizzle-orm';
import { boolean, check, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { externalComponentEvent, externalEvent } from './external';
import { projectEvent } from './projectEvent';
import { componentEvent } from './component';
import { property } from './property';
import { project } from './project';


export const event = pgTable('event', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull(),
  description: varchar('description'),
  type: varchar('type').notNull().default('event'),
  required: boolean('required').notNull().default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('event')`),
]);
export const eventRelations = relations(event, ({ one, many }) => ({
  projectOwner: one(project, {
    references: [project.id],
    fields: [event.projectOwnerId],
    relationName: 'event_projectOwner'
  }),

  externalEvent: one(externalEvent, {
    fields: [event.id],
    references: [externalEvent.eventId],
    relationName: 'externalEvent_event',
  }),

  externalComponentEvent: one(externalComponentEvent, {
    fields: [event.id],
    references: [externalComponentEvent.eventId],
    relationName: 'externalComponentEvent_event',
  }),

  projectEvent: one(projectEvent, {
    fields: [event.id],
    references: [projectEvent.eventId],
    relationName: 'projectEvent_event',
  }),

  componentEvent: one(componentEvent, {
    fields: [event.id],
    references: [componentEvent.eventId],
    relationName: 'componentEvent_event',
  }),

  eventParameters: many(eventParameter, {
    relationName: 'eventParameter_event',
  }),
}));

export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;
export type EventUpdate = Partial<typeof event.$inferInsert>;


export const eventParameter = pgTable('eventParameter', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type').notNull().default('eventParameter'),
  projectOwnerId: uuid('projectOwnerId').notNull().references(() => project.id, { onDelete: 'cascade' }),
  propertyId: uuid('propertyId').notNull().references(() => property.id, { onDelete: 'cascade' }),
  parentEventId: uuid('parentEventId').notNull().references(() => event.id, { onDelete: 'cascade' }),
}, (table) => [
  // Constraints de CHECK
  check('type_check', sql`${table.type} in ('eventParameter')`),
]);
export const eventParameterRelations = relations(eventParameter, ({ one }) => ({
  projectOwner: one(project, {
    references: [project.id],
    fields: [eventParameter.projectOwnerId],
    relationName: 'eventParameter_projectOwner'
  }),

  property: one(property, {
    fields: [eventParameter.propertyId],
    references: [property.id],
    relationName: 'eventParameter_property',
  }),

  parentEvent: one(event, {
    fields: [eventParameter.parentEventId],
    references: [event.id],
    relationName: 'eventParameter_event',
  }),
}));

export type EventParameter = typeof eventParameter.$inferSelect;
export type NewEventParameter = typeof eventParameter.$inferInsert;
export type EventParameterUpdate = Partial<typeof eventParameter.$inferInsert>;
