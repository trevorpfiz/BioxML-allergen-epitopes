"use client";

import type { User } from "@supabase/supabase-js";

import { getNameFromUser } from "~/lib/utils";

export default function UserSettings({ user }: { user: User }) {
  return (
    <>
      <p>{getNameFromUser(user)}</p>
      <p>{user.email ?? ""}</p>
    </>
  );
}
