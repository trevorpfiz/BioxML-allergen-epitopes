import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { Job } from "./job";

// Prediction result
export interface MhcIEpitopeData {
  Peptide_Sequence: string;
  ClassI_TCR_Recognition: number; // TCR recognition score as a number
  ClassI_MHC_Binding_Affinity: string; // HLA types with corresponding binding affinity values
  ClassI_pMHC_Stability: string; // HLA types with corresponding stability values
  Best_Binding_Affinity: string; // Best binding affinity with HLA type
  Best_pMHC_Stability: string; // Best pMHC stability with HLA type
}
export type MhcIEpitopeDataArray = MhcIEpitopeData[];

export const MhcIPrediction = createTable("mhc_i_prediction", (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  sequence: t.text().notNull(),
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
    .$type<MhcIEpitopeDataArray>()
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

export const MhcIPredictionRelations = relations(MhcIPrediction, ({ one }) => ({
  job: one(Job, {
    fields: [MhcIPrediction.jobId],
    references: [Job.id],
  }),
}));

// Schema for MhcIPrediction with manual override for `alleles`
// @link - https://github.com/drizzle-team/drizzle-orm/issues/1110
const baseMhcIPredictionSchema = createSelectSchema(MhcIPrediction, {
  alleles: z.array(z.string()),
}).omit(timestamps);

export const insertMhcIPredictionSchema = createInsertSchema(MhcIPrediction, {
  alleles: z.array(z.string()),
}).omit(timestamps);
export const insertMhcIPredictionParams = insertMhcIPredictionSchema
  .extend({})
  .omit({
    id: true,
  });

export const updateMhcIPredictionSchema = baseMhcIPredictionSchema;
export const updateMhcIPredictionParams = baseMhcIPredictionSchema
  .extend({})
  .omit({})
  .partial()
  .extend({
    id: baseMhcIPredictionSchema.shape.id,
  });
export const mhcIPredictionIdSchema = baseMhcIPredictionSchema.pick({
  id: true,
});

// Types for MhcIPrediction - used to type API request params and within Components
export type MhcIPrediction = typeof MhcIPrediction.$inferSelect;
export type NewMhcIPrediction = z.infer<typeof insertMhcIPredictionSchema>;
export type NewMhcIPredictionParams = z.infer<
  typeof insertMhcIPredictionParams
>;
export type UpdateMhcIPredictionParams = z.infer<
  typeof updateMhcIPredictionParams
>;
export type MhcIPredictionId = z.infer<typeof mhcIPredictionIdSchema>["id"];
