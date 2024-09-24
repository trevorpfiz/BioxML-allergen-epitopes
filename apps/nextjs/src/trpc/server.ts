import { cache } from "react";
import { headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import type { AppRouter } from "@epi/api";
import { createCaller, createTRPCContext } from "@epi/api";

import { createQueryClient } from "~/trpc/query-client";
import { createClient } from "~/utils/supabase/server";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  const supabase = createClient();

  return createTRPCContext({
    headers: heads,
    supabase,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
