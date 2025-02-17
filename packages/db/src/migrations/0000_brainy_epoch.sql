CREATE TYPE "public"."user_integration_type" AS ENUM('codeforces', 'github');--> statement-breakpoint
CREATE TABLE "user_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "user_integration_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
