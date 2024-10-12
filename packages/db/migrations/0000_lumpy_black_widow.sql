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
CREATE TABLE IF NOT EXISTS "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_conformational_b_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pdb_id" varchar(10) NOT NULL,
	"chain" varchar(10) NOT NULL,
	"bcr_recognition_probability_method" varchar(50) NOT NULL,
	"surface_accessibility_method" varchar(50) NOT NULL,
	"result" jsonb[] NOT NULL,
	"csv_download_url" varchar(255),
	"job_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"image" varchar(256),
	"email" varchar(256)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_linear_b_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" text NOT NULL,
	"b_cell_immunogenicity_method" varchar(50) NOT NULL,
	"bcr_recognition_probability_method" varchar(50) NOT NULL,
	"result" jsonb[] NOT NULL,
	"csv_download_url" varchar(255),
	"job_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_mhc_i_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" text NOT NULL,
	"alleles" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"tcr_recognition_probability_method" varchar(50) NOT NULL,
	"mhc_binding_affinity_method" varchar(50) NOT NULL,
	"pmhc_stability_method" varchar(50) NOT NULL,
	"result" jsonb[] NOT NULL,
	"csv_download_url" varchar(255),
	"job_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_mhc_ii_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" text NOT NULL,
	"alleles" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"tcr_recognition_probability_method" varchar(50) NOT NULL,
	"mhc_binding_affinity_method" varchar(50) NOT NULL,
	"pmhc_stability_method" varchar(50) NOT NULL,
	"result" jsonb[] NOT NULL,
	"csv_download_url" varchar(255),
	"job_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"type" "type" NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"share_token" uuid,
	"profile_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_conformational_b_prediction" ADD CONSTRAINT "epi_conformational_b_prediction_job_id_epi_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."epi_job"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_profile" ADD CONSTRAINT "epi_profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
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
CREATE UNIQUE INDEX IF NOT EXISTS "epi_job_share_token_index" ON "epi_job" USING btree ("share_token");