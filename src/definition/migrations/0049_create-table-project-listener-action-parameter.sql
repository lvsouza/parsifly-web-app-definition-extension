CREATE TABLE "projectListenerActionParameter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar DEFAULT 'projectListener' NOT NULL,
	"projectOwnerId" uuid NOT NULL,
	"expressionId" uuid,
	"projectListenerId" uuid,
	"actionParameterId" uuid,
	CONSTRAINT "projectListener_type_check" CHECK ("projectListenerActionParameter"."type" in ('projectListener'))
);
--> statement-breakpoint
ALTER TABLE "projectListenerActionParameter" ADD CONSTRAINT "projectListenerActionParameter_projectOwnerId_project_id_fk" FOREIGN KEY ("projectOwnerId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListenerActionParameter" ADD CONSTRAINT "projectListenerActionParameter_expressionId_expression_id_fk" FOREIGN KEY ("expressionId") REFERENCES "public"."expression"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListenerActionParameter" ADD CONSTRAINT "projectListenerActionParameter_projectListenerId_projectListener_id_fk" FOREIGN KEY ("projectListenerId") REFERENCES "public"."projectListener"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListenerActionParameter" ADD CONSTRAINT "projectListenerActionParameter_actionParameterId_actionParameter_id_fk" FOREIGN KEY ("actionParameterId") REFERENCES "public"."actionParameter"("id") ON DELETE cascade ON UPDATE no action;