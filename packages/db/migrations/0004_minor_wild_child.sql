ALTER TABLE "epi_conformational_b_prediction" DROP CONSTRAINT "epi_conformational_b_prediction_job_id_epi_job_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" DROP CONSTRAINT "epi_linear_b_prediction_job_id_epi_job_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" DROP CONSTRAINT "epi_mhc_i_prediction_job_id_epi_job_id_fk";
--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" DROP CONSTRAINT "epi_mhc_ii_prediction_job_id_epi_job_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_conformational_b_prediction" ADD CONSTRAINT "epi_conformational_b_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_linear_b_prediction" ADD CONSTRAINT "epi_linear_b_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_mhc_i_prediction" ADD CONSTRAINT "epi_mhc_i_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_mhc_ii_prediction" ADD CONSTRAINT "epi_mhc_ii_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
