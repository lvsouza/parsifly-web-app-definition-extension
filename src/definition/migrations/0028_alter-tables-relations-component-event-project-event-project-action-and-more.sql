ALTER TABLE "projectListener" DROP CONSTRAINT "projectListener_eventId_event_id_fk";
--> statement-breakpoint
ALTER TABLE "projectListener" DROP CONSTRAINT "projectListener_actionId_action_id_fk";
--> statement-breakpoint
ALTER TABLE "projectListener" ADD COLUMN "projectEventId" uuid;--> statement-breakpoint
ALTER TABLE "projectListener" ADD COLUMN "projectActionId" uuid;--> statement-breakpoint
ALTER TABLE "componentListener" ADD COLUMN "projectActionId" uuid;--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_projectEventId_projectEvent_id_fk" FOREIGN KEY ("projectEventId") REFERENCES "public"."projectEvent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListener" ADD CONSTRAINT "projectListener_projectActionId_projectAction_id_fk" FOREIGN KEY ("projectActionId") REFERENCES "public"."projectAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_projectActionId_projectAction_id_fk" FOREIGN KEY ("projectActionId") REFERENCES "public"."projectAction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectListener" DROP COLUMN "eventId";--> statement-breakpoint
ALTER TABLE "projectListener" DROP COLUMN "actionId";