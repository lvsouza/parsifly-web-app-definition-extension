CREATE TABLE "external" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"public" boolean DEFAULT false NOT NULL,
	"type" varchar DEFAULT 'external' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	CONSTRAINT "external_name_unique" UNIQUE("name"),
	CONSTRAINT "external_type_check" CHECK ("external"."type" in ('external'))
);
--> statement-breakpoint
CREATE TABLE "externalAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"public" boolean DEFAULT false NOT NULL,
	"type" varchar DEFAULT 'externalAction' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"source" varchar NOT NULL,
	"parentExternalId" uuid NOT NULL,
	CONSTRAINT "externalAction_name_unique" UNIQUE("name"),
	CONSTRAINT "externalAction_type_check" CHECK ("externalAction"."type" in ('externalAction'))
);
--> statement-breakpoint
CREATE TABLE "externalActionOutput" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'externalActionOutput' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentExternalActionId" uuid NOT NULL,
	CONSTRAINT "externalActionOutput_type_check" CHECK ("externalActionOutput"."type" in ('externalActionOutput'))
);
--> statement-breakpoint
CREATE TABLE "externalActionParameter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'externalActionParameter' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentExternalActionId" uuid NOT NULL,
	CONSTRAINT "externalActionParameter_type_check" CHECK ("externalActionParameter"."type" in ('externalActionParameter'))
);
--> statement-breakpoint
CREATE TABLE "externalComponent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"public" boolean DEFAULT false NOT NULL,
	"type" varchar DEFAULT 'externalComponent' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"source" varchar,
	"projectOwnerId" uuid NOT NULL,
	"parentExternalId" uuid NOT NULL,
	CONSTRAINT "externalComponent_name_unique" UNIQUE("name"),
	CONSTRAINT "externalComponent_type_check" CHECK ("externalComponent"."type" in ('externalComponent'))
);
--> statement-breakpoint
CREATE TABLE "externalComponentEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'externalComponentEvent' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentExternalComponentId" uuid NOT NULL,
	CONSTRAINT "externalComponentEvent_type_check" CHECK ("externalComponentEvent"."type" in ('externalComponentEvent'))
);
--> statement-breakpoint
CREATE TABLE "externalComponentParameter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'externalComponentParameter' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentExternalComponentId" uuid NOT NULL,
	CONSTRAINT "externalComponentParameter_type_check" CHECK ("externalComponentParameter"."type" in ('externalComponentParameter'))
);
--> statement-breakpoint
CREATE TABLE "externalComponentSlot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'externalComponentSlot' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentExternalComponentId" uuid NOT NULL,
	CONSTRAINT "externalComponentSlot_type_check" CHECK ("externalComponentSlot"."type" in ('externalComponentSlot'))
);
--> statement-breakpoint
CREATE TABLE "externalEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'externalEvent' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"eventId" uuid NOT NULL,
	"parentExternalId" uuid NOT NULL,
	CONSTRAINT "externalEvent_type_check" CHECK ("externalEvent"."type" in ('externalEvent'))
);
--> statement-breakpoint
ALTER TABLE "external" ADD CONSTRAINT "external_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external" ADD CONSTRAINT "external_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external" ADD CONSTRAINT "external_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalAction" ADD CONSTRAINT "externalAction_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalAction" ADD CONSTRAINT "externalAction_parentExternalId_external_id_fk" FOREIGN KEY ("parentExternalId") REFERENCES "public"."external"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalActionOutput" ADD CONSTRAINT "externalActionOutput_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalActionOutput" ADD CONSTRAINT "externalActionOutput_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalActionOutput" ADD CONSTRAINT "externalActionOutput_parentExternalActionId_externalAction_id_fk" FOREIGN KEY ("parentExternalActionId") REFERENCES "public"."externalAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalActionParameter" ADD CONSTRAINT "externalActionParameter_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalActionParameter" ADD CONSTRAINT "externalActionParameter_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalActionParameter" ADD CONSTRAINT "externalActionParameter_parentExternalActionId_externalAction_id_fk" FOREIGN KEY ("parentExternalActionId") REFERENCES "public"."externalAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponent" ADD CONSTRAINT "externalComponent_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponent" ADD CONSTRAINT "externalComponent_parentExternalId_external_id_fk" FOREIGN KEY ("parentExternalId") REFERENCES "public"."external"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentEvent" ADD CONSTRAINT "externalComponentEvent_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentEvent" ADD CONSTRAINT "externalComponentEvent_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentEvent" ADD CONSTRAINT "externalComponentEvent_parentExternalComponentId_externalComponent_id_fk" FOREIGN KEY ("parentExternalComponentId") REFERENCES "public"."externalComponent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentParameter" ADD CONSTRAINT "externalComponentParameter_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentParameter" ADD CONSTRAINT "externalComponentParameter_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentParameter" ADD CONSTRAINT "externalComponentParameter_parentExternalComponentId_externalComponent_id_fk" FOREIGN KEY ("parentExternalComponentId") REFERENCES "public"."externalComponent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentSlot" ADD CONSTRAINT "externalComponentSlot_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentSlot" ADD CONSTRAINT "externalComponentSlot_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalComponentSlot" ADD CONSTRAINT "externalComponentSlot_parentExternalComponentId_externalComponent_id_fk" FOREIGN KEY ("parentExternalComponentId") REFERENCES "public"."externalComponent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalEvent" ADD CONSTRAINT "externalEvent_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalEvent" ADD CONSTRAINT "externalEvent_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalEvent" ADD CONSTRAINT "externalEvent_parentExternalId_external_id_fk" FOREIGN KEY ("parentExternalId") REFERENCES "public"."external"("id") ON DELETE cascade ON UPDATE no action;