import { pgSchema } from "drizzle-orm/pg-core";

const authSchema = pgSchema("auth");

export const Users = authSchema.table("users", (t) => ({
  id: t.uuid().primaryKey(),
}));

// Used to mock foreign key from profile.id to auth.users table in Supabase
