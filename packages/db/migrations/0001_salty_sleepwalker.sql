ALTER TABLE "epi_conformational_b_prediction" RENAME COLUMN "user_id" TO "profile_id";--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "epi_report" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" RENAME COLUMN "user_id" TO "profile_id";--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" RENAME COLUMN "user_id" TO "profile_id";--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" RENAME COLUMN "user_id" TO "profile_id";--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" DROP CONSTRAINT "epi_conformational_b_prediction_user_id_epi_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" DROP CONSTRAINT "epi_linear_b_prediction_user_id_epi_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" DROP CONSTRAINT "epi_mhc_i_prediction_user_id_epi_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" DROP CONSTRAINT "epi_mhc_ii_prediction_user_id_epi_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ALTER COLUMN "profile_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" ALTER COLUMN "profile_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" ALTER COLUMN "profile_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" ALTER COLUMN "profile_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_conformational_b_prediction" ADD CONSTRAINT "epi_conformational_b_prediction_profile_id_epi_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_linear_b_prediction" ADD CONSTRAINT "epi_linear_b_prediction_profile_id_epi_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_mhc_i_prediction" ADD CONSTRAINT "epi_mhc_i_prediction_profile_id_epi_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_mhc_ii_prediction" ADD CONSTRAINT "epi_mhc_ii_prediction_profile_id_epi_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
