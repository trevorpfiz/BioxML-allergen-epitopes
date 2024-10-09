import type { z } from "zod";
import { relations } from "drizzle-orm";
import { index, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { ConformationalBPrediction } from "./conformational-b-prediction";
import { LinearBPrediction } from "./linear-b-prediction";
import { MhcIPrediction } from "./mhc-i-prediction";
import { MhcIIPrediction } from "./mhc-ii-prediction";
import { Profile } from "./profile";

export const predictionTypes = [
  "linear-b",
  "conformational-b",
  "mhc-i",
  "mhc-ii",
] as const;
export type PredictionType = (typeof predictionTypes)[number];
export const typeEnum = pgEnum("type", predictionTypes);

export const jobStatus = ["pending", "running", "completed", "failed"] as const;
export type JobStatus = (typeof jobStatus)[number];
export const statusEnum = pgEnum("status", jobStatus);

export const Job = createTable(
  "job",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    name: t.varchar({ length: 256 }).notNull(),
    type: typeEnum().notNull(),
    status: statusEnum().notNull().default("pending"),
    shareToken: t.uuid(),

    profileId: t
      .uuid()
      .notNull()
      .references(() => Profile.id),

    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({
        mode: "date",
        withTimezone: true,
      })
      .$onUpdateFn(() => new Date()),
  }),
  (table) => {
    return {
      typeIdx: index().on(table.type),
      shareTokenIdx: uniqueIndex().on(table.shareToken),
    };
  },
);

export const JobRelations = relations(Job, ({ one, many }) => ({
  profile: one(Profile, {
    fields: [Job.profileId],
    references: [Profile.id],
  }),
  linearBPredictions: many(LinearBPrediction),
  conformationalBPredictions: many(ConformationalBPrediction),
  mhcIPredictions: many(MhcIPrediction),
  mhcIIPredictions: many(MhcIIPrediction),
}));

// Schema for Jobs - used to validate API requests
const baseSchema = createSelectSchema(Job).omit(timestamps);

export const insertJobSchema = createInsertSchema(Job).omit(timestamps);
export const insertJobParams = insertJobSchema.extend({}).omit({
  id: true,
  profileId: true,
});

export const updateJobSchema = baseSchema;
export const updateJobParams = baseSchema
  .extend({})
  .omit({
    profileId: true,
  })
  .partial()
  .extend({
    id: baseSchema.shape.id,
  });
export const jobIdSchema = baseSchema.pick({ id: true });

// Types for Jobs - used to type API request params and within Components
export type Job = typeof Job.$inferSelect;
export type NewJob = z.infer<typeof insertJobSchema>;
export type NewJobParams = z.infer<typeof insertJobParams>;
export type UpdateJobParams = z.infer<typeof updateJobParams>;
export type JobId = z.infer<typeof jobIdSchema>["id"];
