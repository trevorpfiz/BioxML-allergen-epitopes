import { Suspense } from "react";
import { notFound } from "next/navigation";

import Loading from "~/app/loading";
import TailwindAdvancedEditor from "~/components/reports/novel/advanced-editor";
import ReportModal from "~/components/reports/report-modal";
import { BackButton } from "~/components/shared/back-button";
import { api } from "~/trpc/server";

export default async function Report({
  params,
}: {
  params: { reportId: string };
}) {
  const { report } = await api.report.byId({ id: params.reportId });

  if (!report) notFound();
  return (
    <main className="overflow-y-auto">
      <Suspense fallback={<Loading />}>
        <div className="relative">
          <BackButton currentResource="reports" />

          <div className="m-4">
            <div className="mb-4 flex items-end justify-between">
              <h1 className="text-2xl font-semibold">{report.title}</h1>
              <div className="flex gap-2">
                <ReportModal report={report} />
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <div
                className={"text-wrap break-all rounded-lg bg-secondary p-1"}
              >
                <TailwindAdvancedEditor
                  reportId={report.id}
                  content={report.content ?? ""}
                />
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </main>
  );
}
