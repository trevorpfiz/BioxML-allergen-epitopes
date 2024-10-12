import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { Job } from "./job";

// Prediction result
export interface MhcIIEpitopeData {
  Peptide_Sequence: string;
  ClassII_TCR_Recognition: number; // TCR recognition score as a number
  ClassII_MHC_Binding_Affinity: string; // HLA types with corresponding binding affinity values
  ClassII_pMHC_Stability: string; // HLA types with corresponding stability values
  Best_Binding_Affinity: string; // Best binding affinity with HLA type
  Best_pMHC_Stability: string; // Best pMHC stability with HLA type
}
export type MhcIIEpitopeDataArray = MhcIIEpitopeData[];

export const MhcIIPrediction = createTable("mhc_ii_prediction", (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  sequence: t.text().notNull(),
  // @link - https://github.com/drizzle-team/drizzle-orm/issues/1110
  alleles: t
    .text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  tcrRecognitionProbabilityMethod: t.varchar({ length: 50 }).notNull(),
  mhcBindingAffinityMethod: t.varchar({ length: 50 }).notNull(),
  pmhcStabilityMethod: t.varchar({ length: 50 }).notNull(),

  result: t
    .jsonb()
    .array()
    .$type<MhcIIEpitopeDataArray>()
    .notNull()
    .default(sql`'{}'::jsonb[]`),
  csvDownloadUrl: t.varchar({ length: 255 }),

  jobId: t
    .uuid()
    .notNull()
    .references(() => Job.id, {
      onDelete: "cascade",
    }),

  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .$onUpdateFn(() => new Date()),
}));

export const MhcIIPredictionRelations = relations(
  MhcIIPrediction,
  ({ one }) => ({
    job: one(Job, {
      fields: [MhcIIPrediction.jobId],
      references: [Job.id],
    }),
  }),
);

// Schema for MhcIIPrediction with manual override for `alleles`
// @link - https://github.com/drizzle-team/drizzle-orm/issues/1110
export const baseMhcIIPredictionSchema = createSelectSchema(MhcIIPrediction, {
  alleles: z.array(z.string()),
}).omit(timestamps);

export const insertMhcIIPredictionSchema = createInsertSchema(MhcIIPrediction, {
  alleles: z.array(z.string()),
}).omit(timestamps);
export const insertMhcIIPredictionParams = insertMhcIIPredictionSchema
  .extend({})
  .omit({
    id: true,
  });

export const updateMhcIIPredictionSchema = baseMhcIIPredictionSchema;
export const updateMhcIIPredictionParams = baseMhcIIPredictionSchema
  .extend({})
  .omit({})
  .partial()
  .extend({
    id: baseMhcIIPredictionSchema.shape.id,
  });
export const mhcIIPredictionIdSchema = baseMhcIIPredictionSchema.pick({
  id: true,
});

// Types for MhcIIPrediction - used to type API request params and within Components
export type MhcIIPrediction = typeof MhcIIPrediction.$inferSelect;
export type NewMhcIIPrediction = z.infer<typeof insertMhcIIPredictionSchema>;
export type NewMhcIIPredictionParams = z.infer<
  typeof insertMhcIIPredictionParams
>;
export type UpdateMhcIIPredictionParams = z.infer<
  typeof updateMhcIIPredictionParams
>;
export type MhcIIPredictionId = z.infer<typeof mhcIIPredictionIdSchema>["id"];
