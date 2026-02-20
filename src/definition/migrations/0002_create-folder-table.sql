CREATE TABLE "folder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'folder' NOT NULL,
	"of" varchar NOT NULL,
	"description" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	CONSTRAINT "folder__name_of_parentFolderId_parentProjectId" UNIQUE NULLS NOT DISTINCT("name","of","parentFolderId","parentProjectId"),
	CONSTRAINT "folder_type_check" CHECK ("folder"."type" in ('folder')),
	CONSTRAINT "folder_parent_not_self" CHECK ("folder"."parentFolderId" <> "folder"."id"),
	CONSTRAINT "folder__project_or_folder_not_null" CHECK ((
      ("folder"."parentProjectId" IS NOT NULL AND "folder"."parentFolderId" IS NULL)
      OR
      ("folder"."parentProjectId" IS NULL AND "folder"."parentFolderId" IS NOT NULL)
    ))
);
--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;