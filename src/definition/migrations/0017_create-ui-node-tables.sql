CREATE TYPE "public"."enum_ui_node_type" AS ENUM('component', 'if', 'loop', 'slot');--> statement-breakpoint
CREATE TABLE "uiNode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'uiNode' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"nodeType" "enum_ui_node_type" NOT NULL,
	CONSTRAINT "uiNode_name_unique" UNIQUE("name"),
	CONSTRAINT "type_check" CHECK ("uiNode"."type" in ('uiNode'))
);
--> statement-breakpoint
CREATE TABLE "uiNodePropertyValue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'uiNodePropertyValue' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"parentUiNodeId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"expressionId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("uiNodePropertyValue"."type" in ('uiNodePropertyValue'))
);
--> statement-breakpoint
ALTER TABLE "uiNode" ADD CONSTRAINT "uiNode_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uiNodePropertyValue" ADD CONSTRAINT "uiNodePropertyValue_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uiNodePropertyValue" ADD CONSTRAINT "uiNodePropertyValue_parentUiNodeId_uiNode_id_fk" FOREIGN KEY ("parentUiNodeId") REFERENCES "public"."uiNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uiNodePropertyValue" ADD CONSTRAINT "uiNodePropertyValue_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uiNodePropertyValue" ADD CONSTRAINT "uiNodePropertyValue_expressionId_expression_id_fk" FOREIGN KEY ("expressionId") REFERENCES "public"."expression"("id") ON DELETE cascade ON UPDATE no action;