"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import Loading from "~/app/(app)/loading";
import EpitopeViewer from "~/components/peptides/epitope-viewer";
import { api } from "~/trpc/react";

interface JobPredictionsProps {
  jobId?: string;
  shareToken?: string;
}

const ConformationalViewer = dynamic(
  () => import("~/components/peptides/3Dmol/conformational-viewer"),
  {
    ssr: false,
  },
);

function JobPredictions(props: JobPredictionsProps) {
  const { jobId, shareToken } = props;

  const router = useRouter();

  const jobQuery = jobId
    ? api.job.byId.useQuery(
        { id: jobId },
        {
          retry: false,
          refetchInterval: (data) => {
            const status = data.state.data?.job.status;
            return status === "pending" || status === "running" ? 5000 : false;
          },
        },
      )
    : shareToken
      ? api.job.getSharedJob.useQuery({ shareToken }, { retry: false })
      : null;

  if (!jobQuery) return null; // In case neither jobId nor shareToken is provided

  const { isPending, isError, data, error } = jobQuery;

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    console.log(error.message);
    router.push("/");
    return null;
  }

  const job = data.job;

  if (job.status === "pending" || job.status === "running") {
    return <Loading />;
  }

  if (job.status === "failed") {
    return <p>Prediction failed. Please try again.</p>;
  }

  const conformationalBPredictions = data.job.conformationalBPredictions;

  return (
    <div className="flex flex-col items-center justify-between gap-4 py-4">
      <h1 className="text-2xl font-bold">{job.name}</h1>

      {/* Render the predictions */}
      {conformationalBPredictions.length > 0 ? (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-16">
          <EpitopeViewer
            prediction={job.conformationalBPredictions[0]?.result ?? []}
          />

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">3D Visualization</h3>
            <div className="w-full border shadow">
              <ConformationalViewer
                epitopeData={job.conformationalBPredictions[0]?.result ?? []}
              />
            </div>
          </div>
        </div>
      ) : (
        <p>No predictions available for this job.</p>
      )}
    </div>
  );
}

export { JobPredictions };
