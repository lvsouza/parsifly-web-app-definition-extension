CREATE TABLE "component" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'component' NOT NULL,
	"description" varchar,
	"public" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	CONSTRAINT "component_name_unique" UNIQUE("name"),
	CONSTRAINT "component__type_is_component" CHECK (type in ('component')),
	CONSTRAINT "component__project_or_folder_not_null" CHECK ((
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  ))
);
--> statement-breakpoint
CREATE TABLE "componentAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'componentAction' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"actionId" uuid NOT NULL,
	"parentComponentId" uuid NOT NULL,
	CONSTRAINT "componentAction__type_is_componentAction" CHECK (type in ('componentAction'))
);
--> statement-breakpoint
CREATE TABLE "componentContent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'componentContent' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"uiNodeId" uuid NOT NULL,
	"parentComponentId" uuid NOT NULL,
	CONSTRAINT "componentContent__type_is_componentContent" CHECK (type in ('componentContent'))
);
--> statement-breakpoint
CREATE TABLE "componentEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'componentEvent' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"eventId" uuid NOT NULL,
	"parentComponentId" uuid NOT NULL,
	CONSTRAINT "componentEvent__type_is_componentEvent" CHECK (type in ('componentEvent'))
);
--> statement-breakpoint
CREATE TABLE "componentListener" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'componentListener' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"projectEventId" uuid,
	"componentEventId" uuid,
	"componentActionId" uuid,
	"parentComponentId" uuid NOT NULL,
	CONSTRAINT "componentListener__type_is_componentListener" CHECK (type in ('componentListener'))
);
--> statement-breakpoint
CREATE TABLE "componentParameter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'componentParameter' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentComponentId" uuid NOT NULL,
	CONSTRAINT "componentParameter__type_is_componentParameter" CHECK (type in ('componentParameter'))
);
--> statement-breakpoint
CREATE TABLE "componentVariable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'componentVariable' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentComponentId" uuid NOT NULL,
	CONSTRAINT "componentVariable__type_is_componentVariable" CHECK (type in ('componentVariable'))
);
--> statement-breakpoint
ALTER TABLE "component" ADD CONSTRAINT "component_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component" ADD CONSTRAINT "component_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component" ADD CONSTRAINT "component_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentAction" ADD CONSTRAINT "componentAction_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentAction" ADD CONSTRAINT "componentAction_actionId_action_id_fk" FOREIGN KEY ("actionId") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentAction" ADD CONSTRAINT "componentAction_parentComponentId_component_id_fk" FOREIGN KEY ("parentComponentId") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentContent" ADD CONSTRAINT "componentContent_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentContent" ADD CONSTRAINT "componentContent_uiNodeId_uiNode_id_fk" FOREIGN KEY ("uiNodeId") REFERENCES "public"."uiNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentContent" ADD CONSTRAINT "componentContent_parentComponentId_component_id_fk" FOREIGN KEY ("parentComponentId") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentEvent" ADD CONSTRAINT "componentEvent_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentEvent" ADD CONSTRAINT "componentEvent_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentEvent" ADD CONSTRAINT "componentEvent_parentComponentId_component_id_fk" FOREIGN KEY ("parentComponentId") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_projectEventId_projectEvent_id_fk" FOREIGN KEY ("projectEventId") REFERENCES "public"."projectEvent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_componentEventId_componentEvent_id_fk" FOREIGN KEY ("componentEventId") REFERENCES "public"."componentEvent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_componentActionId_componentAction_id_fk" FOREIGN KEY ("componentActionId") REFERENCES "public"."componentAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_parentComponentId_component_id_fk" FOREIGN KEY ("parentComponentId") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentParameter" ADD CONSTRAINT "componentParameter_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentParameter" ADD CONSTRAINT "componentParameter_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentParameter" ADD CONSTRAINT "componentParameter_parentComponentId_component_id_fk" FOREIGN KEY ("parentComponentId") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentVariable" ADD CONSTRAINT "componentVariable_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentVariable" ADD CONSTRAINT "componentVariable_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentVariable" ADD CONSTRAINT "componentVariable_parentComponentId_component_id_fk" FOREIGN KEY ("parentComponentId") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;