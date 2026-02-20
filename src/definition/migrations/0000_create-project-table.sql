CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'project' NOT NULL,
	"projectType" varchar DEFAULT 'webApp' NOT NULL,
	"definitionVersion" integer DEFAULT 1 NOT NULL,
	"description" varchar,
	"version" varchar DEFAULT '1.0.0',
	"public" boolean DEFAULT false,
	CONSTRAINT "project_name_unique" UNIQUE("name"),
	CONSTRAINT "type_check" CHECK ("project"."type" in ('project')),
	CONSTRAINT "project_type_check" CHECK ("project"."projectType" in ('webApp')),
	CONSTRAINT "def_version_check" CHECK ("project"."definitionVersion" in (1))
);
