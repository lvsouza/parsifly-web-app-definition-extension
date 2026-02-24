CREATE TYPE "public"."enum_router_node_type" AS ENUM('page', 'redirect', 'condition');--> statement-breakpoint
CREATE TABLE "router" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'router' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"parentProjectId" uuid,
	CONSTRAINT "router__type_is_router" CHECK (type in ('router'))
);
--> statement-breakpoint
CREATE TABLE "routerNode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'routerNode' NOT NULL,
	"path" varchar,
	"nodeType" "enum_router_node_type" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"pageId" uuid,
	"redirectRouterNodeId" uuid,
	"conditionExpressionId" uuid,
	"parentNodeId" uuid,
	"parentRouterId" uuid NOT NULL,
	CONSTRAINT "routerNode__type_is_routerNode" CHECK (type in ('routerNode'))
);
--> statement-breakpoint
ALTER TABLE "router" ADD CONSTRAINT "router_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "router" ADD CONSTRAINT "router_parentProjectId_project_id_fk" FOREIGN KEY ("parentProjectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routerNode" ADD CONSTRAINT "routerNode_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routerNode" ADD CONSTRAINT "routerNode_pageId_page_id_fk" FOREIGN KEY ("pageId") REFERENCES "public"."page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routerNode" ADD CONSTRAINT "routerNode_redirectRouterNodeId_routerNode_id_fk" FOREIGN KEY ("redirectRouterNodeId") REFERENCES "public"."routerNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routerNode" ADD CONSTRAINT "routerNode_conditionExpressionId_expression_id_fk" FOREIGN KEY ("conditionExpressionId") REFERENCES "public"."expression"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routerNode" ADD CONSTRAINT "routerNode_parentNodeId_routerNode_id_fk" FOREIGN KEY ("parentNodeId") REFERENCES "public"."routerNode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routerNode" ADD CONSTRAINT "routerNode_parentRouterId_router_id_fk" FOREIGN KEY ("parentRouterId") REFERENCES "public"."router"("id") ON DELETE cascade ON UPDATE no action;