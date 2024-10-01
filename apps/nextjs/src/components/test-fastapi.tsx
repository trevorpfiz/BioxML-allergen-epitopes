import { api } from "~/trpc/server";
import { createClient } from "~/utils/supabase/server";

export default async function TestFastAPI() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  const query = await api.auth.testFastAPI({
    token: data.session?.access_token ?? "",
  });

  console.log("query", query.data);

  console.log("error", query.error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="my-4 text-2xl font-semibold">Test FastAPI</h1>
      <p>{query.data?.title}</p>
    </div>
  );
}
