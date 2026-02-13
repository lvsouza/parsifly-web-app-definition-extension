CREATE TYPE "public"."enum_web_app_data_type" AS ENUM('enum', 'structure', 'string', 'number', 'boolean', 'null', 'object', 'binary', 'array_enum', 'array_structure', 'array_string', 'array_number', 'array_boolean', 'array_null', 'array_object', 'array_binary');--> statement-breakpoint
CREATE TABLE "property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'folder' NOT NULL,
	"description" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"dataType" "enum_web_app_data_type" DEFAULT 'string' NOT NULL,
	"defaultValue" jsonb,
	"required" boolean DEFAULT false NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentPropertyId" uuid NOT NULL,
	"enumReferenceId" uuid,
	"structureReferenceId" uuid
);
--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_parentPropertyId_property_id_fk" FOREIGN KEY ("parentPropertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_enumReferenceId_enum_id_fk" FOREIGN KEY ("enumReferenceId") REFERENCES "public"."enum"("id") ON DELETE set null ON UPDATE no action;