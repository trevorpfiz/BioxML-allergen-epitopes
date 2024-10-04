"use client";

import React, { useMemo } from "react";
import { createClient } from "@hey-api/client-fetch";
import { useMutation, useQuery } from "@tanstack/react-query";

import { healthCheckOptions, hfPredictMutation } from "@epi/api/client";

import { env } from "~/env";
import { useMySession } from "~/utils/supabase/client";

const TestFastApi: React.FC = () => {
  const { session, loading } = useMySession();

  const apiUrl =
    env.NEXT_PUBLIC_USE_LAMBDA_API === "true"
      ? env.NEXT_PUBLIC_FASTAPI_STAGE_URL
      : env.NEXT_PUBLIC_FASTAPI_URL;

  // Step 1: Create a local API client instance
  const localClient = useMemo(() => {
    if (!session?.access_token) {
      return undefined;
    }
    return createClient({
      baseUrl: apiUrl,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  }, [apiUrl, session?.access_token]);

  // Step 2: Health Check Query
  const healthCheckQuery = useQuery({
    ...healthCheckOptions({ client: localClient }),
    enabled: !!localClient,
  });

  // Step 3: HuggingFace Predict Mutation
  const predictMutation = useMutation({
    ...hfPredictMutation(),
    onSuccess: (data) => {
      console.log("Predict Success:", data);
    },
    onError: (error) => {
      console.error("Predict Error:", error);
    },
  });

  // Step 4: Handle Loading States
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (healthCheckQuery.isPending) {
    return <div>Loading data...</div>;
  }

  // Step 5: Handle Errors
  if (healthCheckQuery.error) {
    return (
      <div>
        <p>Error fetching data:</p>
        <p>Health Check Error: {healthCheckQuery.error.message}</p>
      </div>
    );
  }

  // Step 6: Render the Component UI
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="my-4 text-2xl font-semibold">Test FastAPI</h1>

      {/* Health Check Section */}
      <section>
        <h2 className="text-xl font-bold">Health Check</h2>
        <p>Status: {healthCheckQuery.data.message}</p>
        <button
          onClick={() => healthCheckQuery.refetch()}
          className="mt-2 rounded bg-blue-500 px-4 py-2 text-white"
        >
          Refresh Health Check
        </button>
      </section>

      {/* HuggingFace Predict Section */}
      <section>
        <h2 className="text-xl font-bold">HuggingFace Predict</h2>
        <button
          onClick={() =>
            predictMutation.mutate({
              client: localClient,
              body: { inputs: "Happy this works!" },
            })
          }
          className="mt-2 rounded bg-green-500 px-4 py-2 text-white"
        >
          Run Prediction
        </button>

        <div>
          {/* Mutation States */}
          {predictMutation.isPending && <p>Predicting...</p>}
          {predictMutation.data && (
            <p className="text-green-500">
              Prediction: {predictMutation.data.results[0]?.label}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export { TestFastApi };
