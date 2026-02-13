CREATE TABLE "structure" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'structure' NOT NULL,
	"description" varchar,
	"public" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	CONSTRAINT "structure_name_unique" UNIQUE("name"),
	CONSTRAINT "structure__type_is_structure" CHECK (type in ('structure')),
	CONSTRAINT "structure__project_or_folder_not_null" CHECK ((
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  ))
);
--> statement-breakpoint
CREATE TABLE "structureProperty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'structureProperty' NOT NULL,
	"structureId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	CONSTRAINT "structureProperty__type_is_structureProperty" CHECK (type in ('structureProperty'))
);
--> statement-breakpoint
ALTER TABLE "structure" ADD CONSTRAINT "structure_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structure" ADD CONSTRAINT "structure_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structure" ADD CONSTRAINT "structure_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structureProperty" ADD CONSTRAINT "structureProperty_structureId_structure_id_fk" FOREIGN KEY ("structureId") REFERENCES "public"."structure"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structureProperty" ADD CONSTRAINT "structureProperty_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;