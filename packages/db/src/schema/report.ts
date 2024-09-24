import type { z } from "zod";
import { relations } from "drizzle-orm";
import { text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { timestamps } from "../lib/utils";
import { createTable } from "./_table";
import { Profile } from "./profile";

export const Report = createTable("report", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => Profile.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

export const ReportRelations = relations(Report, ({ one }) => ({
  profile: one(Profile, {
    fields: [Report.profileId],
    references: [Profile.id],
  }),
}));

// Schema for Reports - used to validate API requests
const baseSchema = createSelectSchema(Report).omit(timestamps);

export const insertReportSchema = createInsertSchema(Report).omit(timestamps);
export const insertReportParams = insertReportSchema.extend({}).omit({
  id: true,
  profileId: true,
});

export const updateReportSchema = baseSchema;
export const updateReportParams = baseSchema
  .extend({})
  .omit({
    profileId: true,
  })
  .partial()
  .extend({
    id: baseSchema.shape.id,
  });
export const reportIdSchema = baseSchema.pick({ id: true });

// Types for Reports - used to type API request params and within Components
export type Report = typeof Report.$inferSelect;
export type NewReport = z.infer<typeof insertReportSchema>;
export type NewReportParams = z.infer<typeof insertReportParams>;
export type UpdateReportParams = z.infer<typeof updateReportParams>;
export type ReportId = z.infer<typeof reportIdSchema>["id"];
