CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"type" varchar DEFAULT 'event' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	CONSTRAINT "event_name_unique" UNIQUE("name"),
	CONSTRAINT "type_check" CHECK ("event"."type" in ('event'))
);
--> statement-breakpoint
CREATE TABLE "eventParameter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'eventParameter' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentEventId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("eventParameter"."type" in ('eventParameter'))
);
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventParameter" ADD CONSTRAINT "eventParameter_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventParameter" ADD CONSTRAINT "eventParameter_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventParameter" ADD CONSTRAINT "eventParameter_parentEventId_event_id_fk" FOREIGN KEY ("parentEventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;