import { relations } from "drizzle-orm";
import { index, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { createTable } from "./_table";
import { Users } from "./auth";
import { ConformationalBPrediction } from "./conformational-b-prediction";
import { LinearBPrediction } from "./linear-b-prediction";
import { MhcIPrediction } from "./mhc-i-prediction";
import { MhcIIPrediction } from "./mhc-ii-prediction";
import { Report } from "./report";

export const Profile = createTable(
  "profile",
  {
    // Matches id from auth.users table in Supabase
    id: uuid("id")
      .primaryKey()
      .references(() => Users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 256 }).notNull(),
    image: varchar("image", { length: 256 }),
    email: varchar("email", { length: 256 }),
  },
  (table) => {
    return {
      nameIdx: index("name_idx").on(table.name),
      emailIdx: uniqueIndex("email_idx").on(table.email),
    };
  },
);

export const ProfileRelations = relations(Profile, ({ many }) => ({
  linearBPredictions: many(LinearBPrediction),
  conformationalBPredictions: many(ConformationalBPrediction),
  mhcIPredictions: many(MhcIPrediction),
  mhcIIPredictions: many(MhcIIPrediction),
  reports: many(Report),
}));
