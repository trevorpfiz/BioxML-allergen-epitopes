"use client";

import { useRouter } from "next/navigation";

import Loading from "~/app/(app)/loading";
import { api } from "~/trpc/react";

interface JobPredictionsProps {
  jobId?: string;
  shareToken?: string;
}

function JobPredictions(props: JobPredictionsProps) {
  const { jobId, shareToken } = props;

  const router = useRouter();

  const jobQuery = jobId
    ? api.job.byId.useQuery({ id: jobId }, { retry: false })
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

  const conformationalBPredictions = data.job.conformationalBPredictions;

  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">{data.job.name}</h1>

      {/* Render the predictions */}
      {conformationalBPredictions.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">
            Conformational B Predictions
          </h2>
          <div className="mt-2 space-y-4">
            {conformationalBPredictions.map((prediction) => (
              <div key={prediction.id} className="rounded border p-4">
                <p>
                  <strong>PDB ID:</strong> {prediction.pdbId}
                </p>
                <p>
                  <strong>Chain:</strong> {prediction.chain}
                </p>
                <p>
                  <strong>BCR Recognition Probability Method:</strong>{" "}
                  {prediction.bcrRecognitionProbabilityMethod}
                </p>
                <p>
                  <strong>Surface Accessibility Method:</strong>{" "}
                  {prediction.surfaceAccessibilityMethod}
                </p>
                <p>
                  <strong>Result:</strong>{" "}
                  {JSON.stringify(prediction.result, null, 2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No predictions available for this job.</p>
      )}
    </div>
  );
}

export { JobPredictions };
