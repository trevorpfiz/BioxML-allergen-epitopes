ALTER TABLE "epi_conformational_b_prediction" ALTER COLUMN "pdb_id" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ALTER COLUMN "pdb_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ALTER COLUMN "chain" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ALTER COLUMN "chain" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ALTER COLUMN "surface_accessibility_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_linear_b_prediction" ALTER COLUMN "b_cell_immunogenicity_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ADD COLUMN "sequence" text;--> statement-breakpoint
ALTER TABLE "epi_conformational_b_prediction" ADD COLUMN "is_structure_based" boolean DEFAULT false NOT NULL;