CREATE TYPE "public"."enum_expression_node_type" AS ENUM('start', 'end');--> statement-breakpoint
CREATE TABLE "expression" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'expression' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("expression"."type" in ('expression'))
);
--> statement-breakpoint
CREATE TABLE "expressionNode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'expressionNode' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"nodeType" "enum_expression_node_type" NOT NULL,
	"parentExpressionId" uuid NOT NULL,
	CONSTRAINT "expressionNode_name_unique" UNIQUE("name"),
	CONSTRAINT "type_check" CHECK ("expressionNode"."type" in ('expressionNode'))
);
--> statement-breakpoint
CREATE TABLE "expressionNodePropertyValue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar DEFAULT 'expressionNodePropertyValue' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"parentExpressionNodeId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	CONSTRAINT "expressionNodePropertyValue_name_unique" UNIQUE("name"),
	CONSTRAINT "type_check" CHECK ("expressionNodePropertyValue"."type" in ('expressionNodePropertyValue'))
);
--> statement-breakpoint
ALTER TABLE "expression" ADD CONSTRAINT "expression_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expressionNode" ADD CONSTRAINT "expressionNode_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expressionNode" ADD CONSTRAINT "expressionNode_parentExpressionId_expression_id_fk" FOREIGN KEY ("parentExpressionId") REFERENCES "public"."expression"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expressionNodePropertyValue" ADD CONSTRAINT "expressionNodePropertyValue_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expressionNodePropertyValue" ADD CONSTRAINT "expressionNodePropertyValue_parentExpressionNodeId_expression_id_fk" FOREIGN KEY ("parentExpressionNodeId") REFERENCES "public"."expression"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expressionNodePropertyValue" ADD CONSTRAINT "expressionNodePropertyValue_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;