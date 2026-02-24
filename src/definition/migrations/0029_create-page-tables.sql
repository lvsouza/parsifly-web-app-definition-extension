CREATE TABLE "page" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"public" boolean DEFAULT false,
	"type" varchar DEFAULT 'page' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	CONSTRAINT "page__type_is_page" CHECK (type in ('page')),
	CONSTRAINT "page__project_or_folder_not_null" CHECK ((
      ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
      OR
      ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
    ))
);
--> statement-breakpoint
CREATE TABLE "pageAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'pageAction' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"actionId" uuid NOT NULL,
	"parentPageId" uuid NOT NULL,
	CONSTRAINT "pageAction__type_is_pageAction" CHECK (type in ('pageAction'))
);
--> statement-breakpoint
CREATE TABLE "pageContent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'pageContent' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"uiNodeId" uuid NOT NULL,
	"parentPageId" uuid NOT NULL,
	CONSTRAINT "pageContent__type_is_pageContent" CHECK (type in ('pageContent'))
);
--> statement-breakpoint
CREATE TABLE "pageListener" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'pageListener' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"projectEventId" uuid,
	"componentEventId" uuid,
	"pageActionId" uuid,
	"parentPageId" uuid NOT NULL,
	CONSTRAINT "pageListener__type_is_pageListener" CHECK (type in ('pageListener'))
);
--> statement-breakpoint
CREATE TABLE "pageParameter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'pageParameter' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentPageId" uuid NOT NULL,
	CONSTRAINT "pageParameter__type_is_pageParameter" CHECK (type in ('pageParameter'))
);
--> statement-breakpoint
CREATE TABLE "pageVariable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'pageVariable' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentPageId" uuid NOT NULL,
	CONSTRAINT "pageVariable__type_is_pageVariable" CHECK (type in ('pageVariable'))
);
--> statement-breakpoint
ALTER TABLE "page" ADD CONSTRAINT "page_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page" ADD CONSTRAINT "page_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page" ADD CONSTRAINT "page_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageAction" ADD CONSTRAINT "pageAction_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageAction" ADD CONSTRAINT "pageAction_actionId_action_id_fk" FOREIGN KEY ("actionId") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageAction" ADD CONSTRAINT "pageAction_parentPageId_page_id_fk" FOREIGN KEY ("parentPageId") REFERENCES "public"."page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageContent" ADD CONSTRAINT "pageContent_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageContent" ADD CONSTRAINT "pageContent_uiNodeId_uiNode_id_fk" FOREIGN KEY ("uiNodeId") REFERENCES "public"."uiNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageContent" ADD CONSTRAINT "pageContent_parentPageId_page_id_fk" FOREIGN KEY ("parentPageId") REFERENCES "public"."page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageListener" ADD CONSTRAINT "pageListener_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageListener" ADD CONSTRAINT "pageListener_projectEventId_projectEvent_id_fk" FOREIGN KEY ("projectEventId") REFERENCES "public"."projectEvent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageListener" ADD CONSTRAINT "pageListener_componentEventId_componentEvent_id_fk" FOREIGN KEY ("componentEventId") REFERENCES "public"."componentEvent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageListener" ADD CONSTRAINT "pageListener_pageActionId_pageAction_id_fk" FOREIGN KEY ("pageActionId") REFERENCES "public"."pageAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageListener" ADD CONSTRAINT "pageListener_parentPageId_page_id_fk" FOREIGN KEY ("parentPageId") REFERENCES "public"."page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageParameter" ADD CONSTRAINT "pageParameter_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageParameter" ADD CONSTRAINT "pageParameter_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageParameter" ADD CONSTRAINT "pageParameter_parentPageId_page_id_fk" FOREIGN KEY ("parentPageId") REFERENCES "public"."page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageVariable" ADD CONSTRAINT "pageVariable_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageVariable" ADD CONSTRAINT "pageVariable_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageVariable" ADD CONSTRAINT "pageVariable_parentPageId_page_id_fk" FOREIGN KEY ("parentPageId") REFERENCES "public"."page"("id") ON DELETE cascade ON UPDATE no action;