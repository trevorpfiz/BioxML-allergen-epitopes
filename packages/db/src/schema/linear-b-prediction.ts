import type { z } from "zod";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { Job } from "./job";

// Prediction result
export interface LBEpitopeData {
  Peptide_Sequence: string;
  Linear_B_Cell_Immunogenicity: number;
  Linear_BCR_Recognition: number;
}
export type LBEpitopeDataArray = LBEpitopeData[];

export const LinearBPrediction = createTable("linear_b_prediction", (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  sequence: t.text().notNull(),
  bCellImmunogenicityMethod: t.varchar({ length: 50 }).notNull(),
  bcrRecognitionProbabilityMethod: t.varchar({ length: 50 }).notNull(),

  result: t
    .jsonb()
    .array()
    .$type<LBEpitopeDataArray>()
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

export const LinearBPredictionRelations = relations(
  LinearBPrediction,
  ({ one }) => ({
    job: one(Job, {
      fields: [LinearBPrediction.jobId],
      references: [Job.id],
    }),
  }),
);

// Schema for LinearBPrediction - used to validate API requests
const baseLinearBPredictionSchema =
  createSelectSchema(LinearBPrediction).omit(timestamps);

export const insertLinearBPredictionSchema =
  createInsertSchema(LinearBPrediction).omit(timestamps);
export const insertLinearBPredictionParams = insertLinearBPredictionSchema
  .extend({})
  .omit({
    id: true,
    jobId: true,
  });

export const updateLinearBPredictionSchema = baseLinearBPredictionSchema;
export const updateLinearBPredictionParams = baseLinearBPredictionSchema
  .extend({})
  .omit({
    jobId: true,
  })
  .partial()
  .extend({
    id: baseLinearBPredictionSchema.shape.id,
  });
export const linearBPredictionIdSchema = baseLinearBPredictionSchema.pick({
  id: true,
});

// Types for LinearBPrediction - used to type API request params and within Components
export type LinearBPrediction = typeof LinearBPrediction.$inferSelect;
export type NewLinearBPrediction = z.infer<
  typeof insertLinearBPredictionSchema
>;
export type NewLinearBPredictionParams = z.infer<
  typeof insertLinearBPredictionParams
>;
export type UpdateLinearBPredictionParams = z.infer<
  typeof updateLinearBPredictionParams
>;
export type LinearBPredictionId = z.infer<
  typeof linearBPredictionIdSchema
>["id"];
