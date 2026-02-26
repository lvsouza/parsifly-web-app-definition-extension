ALTER TABLE "externalEvent" ADD COLUMN "public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "externalVariable" ADD COLUMN "public" boolean DEFAULT false NOT NULL;