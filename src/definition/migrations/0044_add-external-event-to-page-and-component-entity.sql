ALTER TABLE "pageListener" RENAME COLUMN "componentEventId" TO "externalEventId";--> statement-breakpoint
ALTER TABLE "pageListener" DROP CONSTRAINT "pageListener_componentEventId_componentEvent_id_fk";
--> statement-breakpoint
ALTER TABLE "componentListener" ADD COLUMN "externalEventId" uuid;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_externalEventId_externalEvent_id_fk" FOREIGN KEY ("externalEventId") REFERENCES "public"."externalEvent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pageListener" ADD CONSTRAINT "pageListener_externalEventId_externalEvent_id_fk" FOREIGN KEY ("externalEventId") REFERENCES "public"."externalEvent"("id") ON DELETE cascade ON UPDATE no action;