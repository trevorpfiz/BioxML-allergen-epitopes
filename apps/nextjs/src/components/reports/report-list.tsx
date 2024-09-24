"use client";

import Link from "next/link";

import type { Report } from "@epi/db/schema";
import { Button } from "@epi/ui/button";

import { api } from "~/trpc/react";
import ReportModal from "./report-modal";

export default function ReportList() {
  const [r] = api.report.byUser.useSuspenseQuery();

  if (r.reports.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul>
      {r.reports.map((report) => (
        <ReportComponent report={report} key={report.id} />
      ))}
    </ul>
  );
}

const ReportComponent = ({ report }: { report: Report }) => {
  return (
    <li className="my-2 flex justify-between">
      <div className="w-full">
        <div>{report.title}</div>
      </div>
      <Button variant={"ghost"} size={"sm"} asChild>
        <Link href={`/reports/${report.id}`}>{"View"}</Link>
      </Button>
    </li>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No reports
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new report.
      </p>
      <div className="mt-6">
        <ReportModal emptyState={true} />
      </div>
    </div>
  );
};
