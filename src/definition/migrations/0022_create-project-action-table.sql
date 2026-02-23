CREATE TABLE "projectAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"type" varchar DEFAULT 'projectAction' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	"actionId" uuid,
	CONSTRAINT "projectAction_type_check" CHECK ("projectAction"."type" in ('projectAction'))
);
--> statement-breakpoint
ALTER TABLE "projectAction" ADD CONSTRAINT "projectAction_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectAction" ADD CONSTRAINT "projectAction_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectAction" ADD CONSTRAINT "projectAction_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectAction" ADD CONSTRAINT "projectAction_actionId_action_id_fk" FOREIGN KEY ("actionId") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;