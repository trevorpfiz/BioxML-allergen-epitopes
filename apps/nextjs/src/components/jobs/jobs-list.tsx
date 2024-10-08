"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Share, Trash2 } from "lucide-react";

import type { Job } from "@epi/db/schema";
import { Button } from "@epi/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@epi/ui/dropdown-menu";

import { ShareDialog } from "~/components/jobs/share-job";
import { env } from "~/env";
import { api } from "~/trpc/react";

export default function JobsList() {
  const utils = api.useUtils();
  const [{ jobs }] = api.job.byUser.useSuspenseQuery();
  const createJobMutation = api.job.create.useMutation({
    onSuccess: () => {
      void utils.job.byUser.invalidate();
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const handleMockJobCreation = async () => {
    for (let i = 0; i < 10; i++) {
      await createJobMutation.mutateAsync({
        name: `Mock Job ${i + 1}`,
        type: "linear-b",
      });
    }
    alert("10 mock jobs created!");
  };

  if (jobs.length === 0 && env.NODE_ENV === "development") {
    return (
      <div className="text-center">
        <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
          No jobs
        </h3>
        <p className="mx-auto mt-1 max-w-40 text-sm text-muted-foreground">
          There are no jobs available. Create mock jobs for testing.
        </p>
        <Button onClick={handleMockJobCreation}>Generate 10 Mock Jobs</Button>
      </div>
    );
  }

  if (jobs.length === 0 && env.NODE_ENV !== "development") {
    return <EmptyState />;
  }

  // Group jobs by date
  const groupedJobs = jobs.reduce(
    (groups, job) => {
      const date = format(job.createdAt, "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(job);
      return groups;
    },
    {} as Record<string, Job[]>,
  );

  return (
    <div className="space-y-4">
      {Object.entries(groupedJobs).map(([date, jobs]) => (
        <div key={date}>
          <h4 className="mb-2 px-2 text-xs uppercase tracking-wider text-muted-foreground">
            {format(new Date(date), "MMMM dd, yyyy")}
          </h4>
          <ul>
            {jobs.map((job) => (
              <JobComponent job={job} key={job.id} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const JobComponent = ({ job }: { job: Job }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      className="group relative my-2 flex items-center justify-between rounded-md p-2 hover:bg-muted"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/job/${job.id}`} className="flex-1">
        <div className="text-sm font-medium">{job.name}</div>
        <div className="text-xs text-muted-foreground">{job.type}</div>
      </Link>
      <div className="flex items-center">{<OptionsMenu job={job} />}</div>
    </li>
  );
};

export const OptionsMenu = ({ job }: { job: Job }) => {
  const utils = api.useUtils();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Mutation for deleting the job
  const deleteMutation = api.job.delete.useMutation({
    onSuccess: () => {
      void utils.job.byUser.invalidate(); // Refresh the job list
      alert("Job deleted successfully.");
    },
    onError: () => {
      alert("Failed to delete job.");
    },
  });

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this job? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate({ id: job.id });
    }
  };

  const handleRename = () => {
    // Implement rename functionality
    alert("Rename functionality not implemented yet.");
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleRename}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleDelete}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareDialog
        jobId={job.id}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No predictions
      </h3>
      <p className="mx-auto mt-1 max-w-40 text-sm text-muted-foreground">
        Get started by creating a new prediction
      </p>
    </div>
  );
};
