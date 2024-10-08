import { api } from "~/trpc/server";
import { createClient } from "~/utils/supabase/server";

async function TestTrpcFastApi() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  const query = await api.auth.testFastAPI({
    token: data.session?.access_token ?? "",
  });

  const predictQuery = await api.auth.predict({
    token: data.session?.access_token ?? "",
  });

  console.log("query", query.data);
  console.log("predictQuery", predictQuery.data);

  console.log("error", query.error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="my-4 text-2xl font-semibold">Test FastAPI</h1>
      <p>{query.data?.title}</p>
      <p>{predictQuery.data?.results[0].label}</p>
    </div>
  );
}

export { TestTrpcFastApi };
