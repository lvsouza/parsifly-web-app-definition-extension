ALTER TABLE "external" ADD COLUMN "source" varchar DEFAULT '// source code here...' NOT NULL;--> statement-breakpoint
ALTER TABLE "externalAction" DROP COLUMN "source";--> statement-breakpoint
ALTER TABLE "externalComponent" DROP COLUMN "source";