CREATE TYPE "public"."enum_web_app_basic_data_type" AS ENUM('string', 'number', 'boolean', 'null');--> statement-breakpoint
CREATE TABLE "enumProperty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'enumProperty' NOT NULL,
	"description" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"dataType" "enum_web_app_basic_data_type" DEFAULT 'string' NOT NULL,
	"defaultValue" jsonb,
	"required" boolean DEFAULT false NOT NULL,
	"parentEnumId" uuid NOT NULL,
	CONSTRAINT "enumProperty__name_parentEnumId" UNIQUE("name","parentEnumId"),
	CONSTRAINT "enumProperty__type_is_enumProperty" CHECK (type in ('enumProperty')),
	CONSTRAINT "enumProperty__defaultValue_only_for_string_number_boolean" CHECK (
    "defaultValue" IS NULL OR (
      "dataType"::text IN ('string','number','boolean')
      AND jsonb_typeof("defaultValue") IN ('string','number','boolean')
    )
  )
);
--> statement-breakpoint
CREATE TABLE "enum" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'enum' NOT NULL,
	"description" varchar,
	"public" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	"parentFolderId" uuid,
	CONSTRAINT "enum_name_unique" UNIQUE("name"),
	CONSTRAINT "enum__type_is_enum" CHECK (type in ('enum')),
	CONSTRAINT "enum__project_or_folder_not_null" CHECK ((
    ("parentProjectId" IS NOT NULL AND "parentFolderId" IS NULL)
    OR
    ("parentProjectId" IS NULL AND "parentFolderId" IS NOT NULL)
  ))
);
--> statement-breakpoint
CREATE TABLE "enumValue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'enumValue' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentEnumId" uuid NOT NULL,
	CONSTRAINT "enumValue__name_parentEnumId" UNIQUE("name","parentEnumId"),
	CONSTRAINT "enumValue__type_is_enumValue" CHECK (type in ('enumValue'))
);
--> statement-breakpoint
CREATE TABLE "enumValueByProperty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'enumValueByProperty' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"value" jsonb,
	"projectOwnerId" uuid NOT NULL,
	"parentEnumValueId" uuid NOT NULL,
	"parentEnumPropertyId" uuid NOT NULL,
	CONSTRAINT "enumValueByProperty__parentEnumValueId_parentEnumPropertyId" UNIQUE("parentEnumValueId","parentEnumPropertyId"),
	CONSTRAINT "enumValueByProperty__type_in_enumValueByProperty" CHECK (type in ('enumValueByProperty')),
	CONSTRAINT "enumValueByProperty__value_only_for_string_number_boolean" CHECK (
    "value" IS NULL
    OR jsonb_typeof("value") IN ('string','number','boolean')
  )
);
--> statement-breakpoint
ALTER TABLE "enumProperty" ADD CONSTRAINT "enumProperty_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enumProperty" ADD CONSTRAINT "enumProperty_parentEnumId_enum_id_fk" FOREIGN KEY ("parentEnumId") REFERENCES "public"."enum"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enum" ADD CONSTRAINT "enum_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enum" ADD CONSTRAINT "enum_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enum" ADD CONSTRAINT "enum_parentFolderId_folder_id_fk" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enumValue" ADD CONSTRAINT "enumValue_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enumValue" ADD CONSTRAINT "enumValue_parentEnumId_enum_id_fk" FOREIGN KEY ("parentEnumId") REFERENCES "public"."enum"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enumValueByProperty" ADD CONSTRAINT "enumValueByProperty_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enumValueByProperty" ADD CONSTRAINT "enumValueByProperty_parentEnumValueId_enumValue_id_fk" FOREIGN KEY ("parentEnumValueId") REFERENCES "public"."enumValue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enumValueByProperty" ADD CONSTRAINT "enumValueByProperty_parentEnumPropertyId_enumProperty_id_fk" FOREIGN KEY ("parentEnumPropertyId") REFERENCES "public"."enumProperty"("id") ON DELETE cascade ON UPDATE no action;