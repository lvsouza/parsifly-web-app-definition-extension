ALTER TABLE "componentListener" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "componentListener" ADD CONSTRAINT "componentListener_name_unique" UNIQUE("name");