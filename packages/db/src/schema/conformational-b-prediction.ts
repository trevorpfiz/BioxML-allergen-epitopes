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

export const ConformationalBPrediction = createTable(
  "conformational_b_prediction",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sequence: text("sequence").notNull(),
    isStructureBased: boolean("is_structure_based").notNull(),
    pdbId: varchar("pdb_id", { length: 10 }),
    chain: varchar("chain", { length: 10 }),
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
  },
);

export const ConformationalBPredictionRelations = relations(
  ConformationalBPrediction,
  ({ one }) => ({
    profile: one(Profile, {
      fields: [ConformationalBPrediction.profileId],
      references: [Profile.id],
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
    profileId: true,
  });

export const updateConformationalBPredictionSchema =
  baseConformationalBPredictionSchema;
export const updateConformationalBPredictionParams =
  baseConformationalBPredictionSchema
    .extend({})
    .omit({
      profileId: true,
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
