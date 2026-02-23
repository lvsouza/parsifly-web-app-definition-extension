ALTER TABLE "externalComponentEvent" RENAME COLUMN "propertyId" TO "eventId";--> statement-breakpoint
ALTER TABLE "externalComponentEvent" DROP CONSTRAINT "externalComponentEvent_propertyId_property_id_fk";
--> statement-breakpoint
ALTER TABLE "externalComponentEvent" ADD CONSTRAINT "externalComponentEvent_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;