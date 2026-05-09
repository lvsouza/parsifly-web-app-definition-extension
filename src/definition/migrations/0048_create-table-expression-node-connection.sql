CREATE TABLE "expressionNodeConnection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'expressionNodeConnection' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"fromExpressionNodeId" uuid NOT NULL,
	"toExpressionNodeId" uuid NOT NULL,
	CONSTRAINT "type_check" CHECK ("expressionNodeConnection"."type" in ('expressionNodeConnection'))
);
--> statement-breakpoint
ALTER TABLE "expressionNodeConnection" ADD CONSTRAINT "expressionNodeConnection_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expressionNodeConnection" ADD CONSTRAINT "expressionNodeConnection_fromExpressionNodeId_expressionNode_id_fk" FOREIGN KEY ("fromExpressionNodeId") REFERENCES "public"."expressionNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expressionNodeConnection" ADD CONSTRAINT "expressionNodeConnection_toExpressionNodeId_expressionNode_id_fk" FOREIGN KEY ("toExpressionNodeId") REFERENCES "public"."expressionNode"("id") ON DELETE cascade ON UPDATE no action;