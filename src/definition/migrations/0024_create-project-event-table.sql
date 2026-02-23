CREATE TABLE "projectEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"type" varchar DEFAULT 'projectEvent' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	"eventId" uuid,
	CONSTRAINT "projectEvent_type_check" CHECK ("projectEvent"."type" in ('projectEvent'))
);
--> statement-breakpoint
ALTER TABLE "projectEvent" ADD CONSTRAINT "projectEvent_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectEvent" ADD CONSTRAINT "projectEvent_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectEvent" ADD CONSTRAINT "projectEvent_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectEvent" ADD CONSTRAINT "projectEvent_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;