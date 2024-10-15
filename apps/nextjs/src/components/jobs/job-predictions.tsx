"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import Loading from "~/app/(app)/loading";
import EpitopeViewer from "~/components/peptides/epitope-viewer";
import { conformationalBColumns } from "~/components/predictions/tables/conformational-b-columns";
import { linearBColumns } from "~/components/predictions/tables/linear-b-columns";
import { mhcIColumns } from "~/components/predictions/tables/mhc-i-columns";
import { mhcIIColumns } from "~/components/predictions/tables/mhc-ii-columns";
import { PredictionDataTable } from "~/components/predictions/tables/prediction-data-table";
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
            return status === "pending" || status === "running" ? 3000 : false;
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

  // Check the prediction type and render the appropriate components
  const renderPrediction = () => {
    if (job.conformationalBPredictions.length > 0) {
      const prediction = job.conformationalBPredictions[0];
      return (
        <>
          <div className="flex flex-col gap-4">
            <PredictionDataTable
              columns={conformationalBColumns}
              data={prediction?.result ?? []}
            />
          </div>
          <EpitopeViewer prediction={prediction?.result ?? []} />
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">3D Visualization</h3>
            <div className="w-full border shadow">
              <ConformationalViewer epitopeData={prediction?.result ?? []} />
            </div>
          </div>
        </>
      );
    } else if (job.linearBPredictions.length > 0) {
      const prediction = job.linearBPredictions[0];
      return (
        <>
          <div>
            <div className="flex flex-col gap-4">
              <PredictionDataTable
                columns={linearBColumns}
                data={prediction?.result ?? []}
              />
            </div>
          </div>
        </>
      );
    } else if (job.mhcIPredictions.length > 0) {
      const prediction = job.mhcIPredictions[0];
      return (
        <>
          <div>
            <div className="flex flex-col gap-4">
              <PredictionDataTable
                columns={mhcIColumns}
                data={prediction?.result ?? []}
              />
            </div>
          </div>
        </>
      );
    } else if (job.mhcIIPredictions.length > 0) {
      const prediction = job.mhcIIPredictions[0];
      return (
        <>
          <div>
            <div className="flex flex-col gap-4">
              <PredictionDataTable
                columns={mhcIIColumns}
                data={prediction?.result ?? []}
              />
            </div>
          </div>
        </>
      );
    } else {
      return <p>No predictions available for this job.</p>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 py-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-16">
        {renderPrediction()}
      </div>
    </div>
  );
}

export { JobPredictions };
