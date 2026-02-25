CREATE TABLE "externalVariable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'externalVariable' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentExternalId" uuid NOT NULL,
	CONSTRAINT "externalVariable_type_check" CHECK ("externalVariable"."type" in ('externalVariable'))
);
--> statement-breakpoint
ALTER TABLE "externalVariable" ADD CONSTRAINT "externalVariable_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalVariable" ADD CONSTRAINT "externalVariable_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "externalVariable" ADD CONSTRAINT "externalVariable_parentExternalId_external_id_fk" FOREIGN KEY ("parentExternalId") REFERENCES "public"."external"("id") ON DELETE cascade ON UPDATE no action;