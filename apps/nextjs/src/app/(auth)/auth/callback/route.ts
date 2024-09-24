import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";

import { createClient } from "~/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirect(next);
    }
  }

  // return the user to an error page with instructions
  return redirect("/auth/error");
}
