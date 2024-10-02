import { client } from "@epi/api/client";

import { useMySession } from "~/utils/supabase/client";

export const useApiClient = () => {
  const { session } = useMySession();

  client.setConfig({
    baseUrl: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
};
