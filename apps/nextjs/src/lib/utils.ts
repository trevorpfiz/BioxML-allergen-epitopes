import type { User } from "@supabase/supabase-js";

export function getNameFromUser(user: User) {
  const meta = user.user_metadata;
  if (typeof meta.name === "string") return meta.name;
  if (typeof meta.full_name === "string") return meta.full_name;
  if (typeof meta.user_name === "string") return meta.user_name;
  return "[redacted]";
}
