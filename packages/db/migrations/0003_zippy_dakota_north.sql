ALTER TABLE "user_integrations" ALTER COLUMN "external_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_integrations" ALTER COLUMN "external_id" SET NOT NULL;