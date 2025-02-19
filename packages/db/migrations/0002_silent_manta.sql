ALTER TABLE "user_integrations" ALTER COLUMN "external_id" SET DEFAULT 'undefined';--> statement-breakpoint
ALTER TABLE "user_integrations" ALTER COLUMN "external_id" DROP NOT NULL;