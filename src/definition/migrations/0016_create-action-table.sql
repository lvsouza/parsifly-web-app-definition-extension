CREATE TYPE "public"."enum_action_node_type" AS ENUM('start', 'end');--> statement-breakpoint
CREATE TABLE "action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"type" varchar DEFAULT 'action' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	CONSTRAINT "action_name_unique" UNIQUE("name"),
	CONSTRAINT "type_check" CHECK ("action"."type" in ('action'))
);
--> statement-breakpoint
CREATE TABLE "actionNode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'actionNode' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentActionId" uuid NOT NULL,
	"top" integer NOT NULL,
	"left" integer NOT NULL,
	"nodeType" "enum_action_node_type" NOT NULL,
	CONSTRAINT "type_check" CHECK ("actionNode"."type" in ('actionNode'))
);
--> statement-breakpoint
CREATE TABLE "actionNodeConnection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'actionNodeConnection' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"fromActionNodeId" uuid NOT NULL,
	"toActionNodeId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("actionNodeConnection"."type" in ('actionNodeConnection'))
);
--> statement-breakpoint
CREATE TABLE "actionNodePropertyValue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'actionNodePropertyValue' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentActionNodeId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"expressionId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("actionNodePropertyValue"."type" in ('actionNodePropertyValue'))
);
--> statement-breakpoint
CREATE TABLE "actionOutput" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'actionOutput' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentActionId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("actionOutput"."type" in ('actionOutput'))
);
--> statement-breakpoint
CREATE TABLE "actionParameter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'actionParameter' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentActionId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("actionParameter"."type" in ('actionParameter'))
);
--> statement-breakpoint
CREATE TABLE "actionVariable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'actionVariable' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"parentActionId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("actionVariable"."type" in ('actionVariable'))
);
--> statement-breakpoint
ALTER TABLE "action" ADD CONSTRAINT "action_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNode" ADD CONSTRAINT "actionNode_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNode" ADD CONSTRAINT "actionNode_parentActionId_action_id_fk" FOREIGN KEY ("parentActionId") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNodeConnection" ADD CONSTRAINT "actionNodeConnection_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNodeConnection" ADD CONSTRAINT "actionNodeConnection_fromActionNodeId_actionNode_id_fk" FOREIGN KEY ("fromActionNodeId") REFERENCES "public"."actionNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNodeConnection" ADD CONSTRAINT "actionNodeConnection_toActionNodeId_actionNode_id_fk" FOREIGN KEY ("toActionNodeId") REFERENCES "public"."actionNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNodePropertyValue" ADD CONSTRAINT "actionNodePropertyValue_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNodePropertyValue" ADD CONSTRAINT "actionNodePropertyValue_parentActionNodeId_actionNode_id_fk" FOREIGN KEY ("parentActionNodeId") REFERENCES "public"."actionNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNodePropertyValue" ADD CONSTRAINT "actionNodePropertyValue_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionNodePropertyValue" ADD CONSTRAINT "actionNodePropertyValue_expressionId_expression_id_fk" FOREIGN KEY ("expressionId") REFERENCES "public"."expression"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionOutput" ADD CONSTRAINT "actionOutput_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionOutput" ADD CONSTRAINT "actionOutput_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionOutput" ADD CONSTRAINT "actionOutput_parentActionId_action_id_fk" FOREIGN KEY ("parentActionId") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionParameter" ADD CONSTRAINT "actionParameter_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionParameter" ADD CONSTRAINT "actionParameter_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionParameter" ADD CONSTRAINT "actionParameter_parentActionId_action_id_fk" FOREIGN KEY ("parentActionId") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionVariable" ADD CONSTRAINT "actionVariable_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionVariable" ADD CONSTRAINT "actionVariable_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actionVariable" ADD CONSTRAINT "actionVariable_parentActionId_action_id_fk" FOREIGN KEY ("parentActionId") REFERENCES "public"."action"("id") ON DELETE cascade ON UPDATE no action;