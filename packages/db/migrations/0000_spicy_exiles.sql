CREATE TABLE IF NOT EXISTS "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_conformational_b_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" text NOT NULL,
	"is_structure_based" boolean NOT NULL,
	"pdb_id" varchar(10),
	"chain" varchar(10),
	"result" jsonb NOT NULL,
	"csv_download_url" varchar(255),
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"image" varchar(256),
	"email" varchar(256)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text,
	"profile_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_linear_b_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" text NOT NULL,
	"result" jsonb NOT NULL,
	"csv_download_url" varchar(255),
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_mhc_i_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" text NOT NULL,
	"prediction_method" varchar(50) NOT NULL,
	"species" varchar(50) NOT NULL,
	"allele" varchar(50) NOT NULL,
	"show_only_frequent_alleles" boolean NOT NULL,
	"result" jsonb NOT NULL,
	"csv_download_url" varchar(255),
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epi_mhc_ii_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence" text NOT NULL,
	"prediction_method" varchar(50) NOT NULL,
	"species_locus" varchar(50) NOT NULL,
	"allele" varchar(50) NOT NULL,
	"separate_alpha_beta_chains" boolean NOT NULL,
	"peptide_length" integer NOT NULL,
	"result" jsonb NOT NULL,
	"csv_download_url" varchar(255),
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_conformational_b_prediction" ADD CONSTRAINT "epi_conformational_b_prediction_user_id_epi_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "epi_report" ADD CONSTRAINT "epi_report_profile_id_epi_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_linear_b_prediction" ADD CONSTRAINT "epi_linear_b_prediction_user_id_epi_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_mhc_i_prediction" ADD CONSTRAINT "epi_mhc_i_prediction_user_id_epi_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epi_mhc_ii_prediction" ADD CONSTRAINT "epi_mhc_ii_prediction_user_id_epi_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."epi_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "epi_profile" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "epi_profile" USING btree ("email");