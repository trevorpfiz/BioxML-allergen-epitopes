import type { z } from "zod";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { Job } from "./job";

export const ConformationalBPrediction = createTable(
  "conformational_b_prediction",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    sequence: t.text().notNull(),
    isStructureBased: t.boolean().notNull(),
    pdbId: t.varchar({ length: 10 }),
    chain: t.varchar({ length: 10 }),
    result: t.jsonb().notNull(),
    csvDownloadUrl: t.varchar({ length: 255 }),

    jobId: t
      .uuid()
      .notNull()
      .references(() => Job.id),

    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({
        mode: "date",
        withTimezone: true,
      })
      .$onUpdateFn(() => new Date()),
  }),
);

export const ConformationalBPredictionRelations = relations(
  ConformationalBPrediction,
  ({ one }) => ({
    job: one(Job, {
      fields: [ConformationalBPrediction.jobId],
      references: [Job.id],
    }),
  }),
);

// Schema for ConformationalBPrediction - used to validate API requests
const baseConformationalBPredictionSchema = createSelectSchema(
  ConformationalBPrediction,
).omit(timestamps);

export const insertConformationalBPredictionSchema = createInsertSchema(
  ConformationalBPrediction,
).omit(timestamps);
export const insertConformationalBPredictionParams =
  insertConformationalBPredictionSchema.extend({}).omit({
    id: true,
    jobId: true,
  });

export const updateConformationalBPredictionSchema =
  baseConformationalBPredictionSchema;
export const updateConformationalBPredictionParams =
  baseConformationalBPredictionSchema
    .extend({})
    .omit({
      jobId: true,
    })
    .partial()
    .extend({
      id: baseConformationalBPredictionSchema.shape.id,
    });
export const conformationalBPredictionIdSchema =
  baseConformationalBPredictionSchema.pick({ id: true });

// Types for ConformationalBPrediction - used to type API request params and within Components
export type ConformationalBPrediction =
  typeof ConformationalBPrediction.$inferSelect;
export type NewConformationalBPrediction = z.infer<
  typeof insertConformationalBPredictionSchema
>;
export type NewConformationalBPredictionParams = z.infer<
  typeof insertConformationalBPredictionParams
>;
export type UpdateConformationalBPredictionParams = z.infer<
  typeof updateConformationalBPredictionParams
>;
export type ConformationalBPredictionId = z.infer<
  typeof conformationalBPredictionIdSchema
>["id"];
