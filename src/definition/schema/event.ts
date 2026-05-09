import { sql } from 'drizzle-orm';
import { boolean, check, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

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

export type EventParameter = typeof eventParameter.$inferSelect;
export type NewEventParameter = typeof eventParameter.$inferInsert;
export type EventParameterUpdate = Partial<typeof eventParameter.$inferInsert>;
