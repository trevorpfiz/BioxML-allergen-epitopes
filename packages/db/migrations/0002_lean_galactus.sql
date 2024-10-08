DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('pending', 'running', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('linear-b', 'conformational-b', 'mhc-i', 'mhc-ii');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "epi_report" RENAME TO "epi_job";--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" RENAME COLUMN "profile_id" TO "job_id";--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" RENAME COLUMN "profile_id" TO "job_id";--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" RENAME COLUMN "profile_id" TO "job_id";--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" RENAME COLUMN "profile_id" TO "job_id";--> statement-breakpoint
ALTER TABLE "epi_job" RENAME COLUMN "title" TO "name";--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" DROP CONSTRAINT "epi_conformational_b_prediction_profile_id_epi_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" DROP CONSTRAINT "epi_linear_b_prediction_profile_id_epi_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" DROP CONSTRAINT "epi_mhc_i_prediction_profile_id_epi_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" DROP CONSTRAINT "epi_mhc_ii_prediction_profile_id_epi_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_job" DROP CONSTRAINT "epi_report_profile_id_epi_profile_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "email_idx";--> statement-breakpoint
ALTER TABLE "epi_job" ADD COLUMN "type" "type" NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_job" ADD COLUMN "status" "status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_job" ADD COLUMN "share_token" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_conformational_b_prediction" ADD CONSTRAINT "epi_conformational_b_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_linear_b_prediction" ADD CONSTRAINT "epi_linear_b_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_mhc_i_prediction" ADD CONSTRAINT "epi_mhc_i_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_mhc_ii_prediction" ADD CONSTRAINT "epi_mhc_ii_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_job" ADD CONSTRAINT "epi_job_profile_id_epi_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "epi_profile_name_index" ON "epi_profile" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "epi_profile_email_index" ON "epi_profile" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "epi_job_type_index" ON "epi_job" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "epi_job_share_token_index" ON "epi_job" USING btree ("share_token");--> statement-breakpoint
ALTER TABLE "epi_job" DROP COLUMN IF EXISTS "content";