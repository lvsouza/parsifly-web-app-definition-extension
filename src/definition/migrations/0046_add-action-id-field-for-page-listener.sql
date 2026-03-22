ALTER TABLE "projectListener" ADD COLUMN "externalActionId" uuid;--> statement-breakpoint
ALTER TABLE "componentListener" ADD COLUMN "externalActionId" uuid;--> statement-breakpoint
ALTER TABLE "pageListener" ADD COLUMN "projectActionId" uuid;--> statement-breakpoint
ALTER TABLE "pageListener" ADD COLUMN "externalActionId" uuid;--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_externalActionId_externalAction_id_fk" FOREIGN KEY ("externalActionId") REFERENCES "public"."externalAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_externalActionId_externalAction_id_fk" FOREIGN KEY ("externalActionId") REFERENCES "public"."externalAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageListener" ADD CONSTRAINT "pageListener_projectActionId_projectAction_id_fk" FOREIGN KEY ("projectActionId") REFERENCES "public"."projectAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageListener" ADD CONSTRAINT "pageListener_externalActionId_externalAction_id_fk" FOREIGN KEY ("externalActionId") REFERENCES "public"."externalAction"("id") ON DELETE cascade ON UPDATE no action;