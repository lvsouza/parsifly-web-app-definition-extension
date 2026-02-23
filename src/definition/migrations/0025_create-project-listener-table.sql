CREATE TABLE "projectListener" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"type" varchar DEFAULT 'projectListener' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	"eventId" uuid,
	"actionId" uuid,
	CONSTRAINT "projectListener_name_unique" UNIQUE("name"),
	CONSTRAINT "projectListener_type_check" CHECK ("projectListener"."type" in ('projectListener'))
);
--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_actionId_action_id_fk" FOREIGN KEY ("actionId") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;