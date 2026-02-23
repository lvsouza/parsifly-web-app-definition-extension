ALTER TABLE "projectVariable" ADD CONSTRAINT "projectVariable_project_or_folder_not_null" CHECK ((
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  ));--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_project_or_folder_not_null" CHECK ((
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  ));--> statement-breakpoint
ALTER TABLE "projectAction" ADD CONSTRAINT "projectAction_project_or_folder_not_null" CHECK ((
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  ));--> statement-breakpoint
ALTER TABLE "projectEvent" ADD CONSTRAINT "projectEvent_project_or_folder_not_null" CHECK ((
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  ));--> statement-breakpoint
ALTER TABLE "external" ADD CONSTRAINT "external_project_or_folder_not_null" CHECK ((
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  ));