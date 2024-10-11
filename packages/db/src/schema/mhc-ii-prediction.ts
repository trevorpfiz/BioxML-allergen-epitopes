import type { z } from "zod";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { Job } from "./job";

export const MhcIIPrediction = createTable("mhc_ii_prediction", (t) => ({
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

// Schema for MhcIIPrediction - used to validate API requests
const baseMhcIIPredictionSchema =
  createSelectSchema(MhcIIPrediction).omit(timestamps);

export const insertMhcIIPredictionSchema =
  createInsertSchema(MhcIIPrediction).omit(timestamps);
export const insertMhcIIPredictionParams = insertMhcIIPredictionSchema
  .extend({})
  .omit({
    id: true,
    jobId: true,
  });

export const updateMhcIIPredictionSchema = baseMhcIIPredictionSchema;
export const updateMhcIIPredictionParams = baseMhcIIPredictionSchema
  .extend({})
  .omit({
    jobId: true,
  })
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
