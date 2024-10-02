import type { z } from "zod";
import { relations } from "drizzle-orm";
import { jsonb, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { Profile } from "./profile";

export const LinearBPrediction = createTable("linear_b_prediction", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequence: text("sequence").notNull(),
  result: jsonb("result").notNull(),
  csvDownloadUrl: varchar("csv_download_url", { length: 255 }),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => Profile.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

export const LinearBPredictionRelations = relations(
  LinearBPrediction,
  ({ one }) => ({
    profile: one(Profile, {
      fields: [LinearBPrediction.profileId],
      references: [Profile.id],
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
    profileId: true,
  });

export const updateLinearBPredictionSchema = baseLinearBPredictionSchema;
export const updateLinearBPredictionParams = baseLinearBPredictionSchema
  .extend({})
  .omit({
    profileId: true,
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
