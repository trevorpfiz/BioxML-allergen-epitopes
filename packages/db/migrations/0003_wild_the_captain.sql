ALTER TABLE "epi_conformational_b_prediction" ALTER COLUMN "pdb_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ALTER COLUMN "chain" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ADD COLUMN "bcr_recognition_probability_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ADD COLUMN "surface_accessibility_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" ADD COLUMN "b_cell_immunogenicity_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" ADD COLUMN "bcr_recognition_probability_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" ADD COLUMN "alleles" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" ADD COLUMN "tcr_recognition_probability_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" ADD COLUMN "mhc_binding_affinity_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" ADD COLUMN "pmhc_stability_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" ADD COLUMN "alleles" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" ADD COLUMN "tcr_recognition_probability_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" ADD COLUMN "mhc_binding_affinity_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" ADD COLUMN "pmhc_stability_method" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" DROP COLUMN IF EXISTS "sequence";--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" DROP COLUMN IF EXISTS "is_structure_based";--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" DROP COLUMN IF EXISTS "prediction_method";--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" DROP COLUMN IF EXISTS "species";--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" DROP COLUMN IF EXISTS "allele";--> statement-breakpoint
ALTER TABLE "epi_mhc_i_prediction" DROP COLUMN IF EXISTS "show_only_frequent_alleles";--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" DROP COLUMN IF EXISTS "prediction_method";--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" DROP COLUMN IF EXISTS "species_locus";--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" DROP COLUMN IF EXISTS "allele";--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" DROP COLUMN IF EXISTS "separate_alpha_beta_chains";--> statement-breakpoint
ALTER TABLE "epi_mhc_ii_prediction" DROP COLUMN IF EXISTS "peptide_length";