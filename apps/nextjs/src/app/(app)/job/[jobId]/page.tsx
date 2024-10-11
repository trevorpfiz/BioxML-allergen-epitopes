import { JobPredictions } from "~/components/jobs/job-predictions";

export default function JobPage({ params }: { params: { jobId: string } }) {
  return (
    <main>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-8">
        <div className="w-full">
          <JobPredictions jobId={params.jobId} />
        </div>
      </div>
    </main>
  );
}
