import type { z } from "zod";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
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

export const MhcIIPrediction = createTable("mhc_ii_prediction", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequence: text("sequence").notNull(),
  predictionMethod: varchar("prediction_method", { length: 50 }).notNull(),
  speciesLocus: varchar("species_locus", { length: 50 }).notNull(),
  allele: varchar("allele", { length: 50 }).notNull(),
  separateAlphaBetaChains: boolean("separate_alpha_beta_chains").notNull(),
  peptideLength: integer("peptide_length").notNull(),
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

export const MhcIIPredictionRelations = relations(
  MhcIIPrediction,
  ({ one }) => ({
    profile: one(Profile, {
      fields: [MhcIIPrediction.profileId],
      references: [Profile.id],
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
    profileId: true,
  });

export const updateMhcIIPredictionSchema = baseMhcIIPredictionSchema;
export const updateMhcIIPredictionParams = baseMhcIIPredictionSchema
  .extend({})
  .omit({
    profileId: true,
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
