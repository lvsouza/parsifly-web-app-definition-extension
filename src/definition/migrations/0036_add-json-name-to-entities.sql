ALTER TABLE "externalAction" RENAME COLUMN "sourceName" TO "jsonName";--> statement-breakpoint
ALTER TABLE "externalComponent" RENAME COLUMN "sourceName" TO "jsonName";--> statement-breakpoint
ALTER TABLE "externalEvent" RENAME COLUMN "sourceName" TO "jsonName";--> statement-breakpoint
ALTER TABLE "property" ADD COLUMN "jsonName" varchar DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "enumProperty" ADD COLUMN "jsonName" varchar DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "externalVariable" DROP COLUMN "sourceName";