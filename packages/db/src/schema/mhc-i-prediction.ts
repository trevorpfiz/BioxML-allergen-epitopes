import type { z } from "zod";
import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { Profile } from "./profile";

export const MhcIPrediction = createTable("mhc_i_prediction", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequence: text("sequence").notNull(),
  predictionMethod: varchar("prediction_method", { length: 50 }).notNull(),
  species: varchar("species", { length: 50 }).notNull(),
  allele: varchar("allele", { length: 50 }).notNull(),
  showOnlyFrequentAlleles: boolean("show_only_frequent_alleles").notNull(),
  result: jsonb("result").notNull(),
  csvDownloadUrl: varchar("csv_download_url", { length: 255 }),
  profileId: uuid("user_id")
    .notNull()
    .references(() => Profile.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

export const MhcIPredictionRelations = relations(MhcIPrediction, ({ one }) => ({
  profile: one(Profile, {
    fields: [MhcIPrediction.profileId],
    references: [Profile.id],
  }),
}));

// Schema for MhcIPrediction - used to validate API requests
const baseMhcIPredictionSchema =
  createSelectSchema(MhcIPrediction).omit(timestamps);

export const insertMhcIPredictionSchema =
  createInsertSchema(MhcIPrediction).omit(timestamps);
export const insertMhcIPredictionParams = insertMhcIPredictionSchema
  .extend({})
  .omit({
    id: true,
    profileId: true,
  });

export const updateMhcIPredictionSchema = baseMhcIPredictionSchema;
export const updateMhcIPredictionParams = baseMhcIPredictionSchema
  .extend({})
  .omit({
    profileId: true,
  })
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
