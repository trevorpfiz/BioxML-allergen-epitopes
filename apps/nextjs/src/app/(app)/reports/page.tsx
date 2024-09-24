import { Suspense } from "react";

import Loading from "~/app/loading";
import ReportList from "~/components/reports/report-list";
import NewReportModal from "~/components/reports/report-modal";
import { api, HydrateClient } from "~/trpc/server";

export default function Reports() {
  void api.report.byUser.prefetch();

  return (
    <HydrateClient>
      <main>
        <div className="flex justify-between">
          <h1 className="my-2 text-2xl font-semibold">Reports</h1>
          <NewReportModal />
        </div>
        <Suspense
          fallback={
            <div className="flex w-full flex-col gap-4">
              <Loading />
            </div>
          }
        >
          <ReportList />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
