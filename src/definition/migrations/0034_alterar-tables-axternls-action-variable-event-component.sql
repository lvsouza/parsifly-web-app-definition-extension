ALTER TABLE "externalAction" ADD COLUMN "sourceName" varchar DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "externalComponent" ADD COLUMN "sourceName" varchar DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "externalEvent" ADD COLUMN "sourceName" varchar DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "externalVariable" ADD COLUMN "sourceName" varchar DEFAULT '' NOT NULL;