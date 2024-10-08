"use client";

import { useRouter } from "next/navigation";

import Loading from "~/app/(app)/loading";
import { api } from "~/trpc/react";

function JobPredictions({ jobId }: { jobId: string }) {
  const router = useRouter();

  const { isPending, isError, data, error } = api.job.byId.useQuery(
    {
      id: jobId,
    },
    {
      retry: false,
    },
  );

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    console.log(error.message);
    router.push("/");
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">{data.job.name}</h1>
    </div>
  );
}

export { JobPredictions };
