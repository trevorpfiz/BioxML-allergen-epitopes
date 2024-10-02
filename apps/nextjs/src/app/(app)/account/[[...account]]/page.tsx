import { SignOutButton } from "~/components/auth/sign-out-button";
import { TestFastApi } from "~/components/test-fastapi";
import { TestTrpcFastApi } from "~/components/test-trpc-fastapi";
import { createClient } from "~/utils/supabase/server";
import UserSettings from "./user-settings";

export default async function Account() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (error ?? !data.user.id) {
    throw new Error("User not found");
  }

  if (sessionError ?? !session?.access_token) {
    throw new Error("Session not found");
  }

  return (
    <main>
      <div className="flex flex-col gap-4">
        <h1 className="my-4 text-2xl font-semibold">Account</h1>
        <div className="space-y-4 pb-4">
          <UserSettings user={data.user} />
        </div>
        <TestFastApi />
        {/* <TestTrpcFastApi /> */}
        {/* FIXME: leading to multiple anonymous profiles being created? */}
        {!data.user.is_anonymous && <SignOutButton />}
      </div>
    </main>
  );
}
