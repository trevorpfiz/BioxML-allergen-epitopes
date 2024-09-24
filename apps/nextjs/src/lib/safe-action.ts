import { createSafeActionClient } from "next-safe-action";

import { createClient } from "~/utils/supabase/server";

// Base client
export const actionClient = createSafeActionClient();

// Auth client
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authActionClient = actionClient.use(async ({ next, ctx }) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error ?? !data.user) {
    throw new Error("Unauthorized");
  }

  return next({ ctx: { supabase, user: data.user } });
});
