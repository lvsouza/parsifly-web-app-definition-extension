CREATE TABLE "projectVariable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"type" varchar DEFAULT 'projectVariable' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	"propertyId" uuid,
	CONSTRAINT "projectVariable_type_check" CHECK ("projectVariable"."type" in ('projectVariable'))
);
--> statement-breakpoint
ALTER TABLE "projectVariable" ADD CONSTRAINT "projectVariable_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectVariable" ADD CONSTRAINT "projectVariable_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectVariable" ADD CONSTRAINT "projectVariable_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectVariable" ADD CONSTRAINT "projectVariable_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;