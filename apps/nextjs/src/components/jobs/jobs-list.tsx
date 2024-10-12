"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Share, Trash2 } from "lucide-react";

import type { Job } from "@epi/db/schema";
import { cn } from "@epi/ui";
import { Button } from "@epi/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@epi/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@epi/ui/tooltip";

import { env } from "~/env";
import { useShareDialogStore } from "~/providers/share-dialog-store-provider";
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
  const pathname = usePathname();
  const isActive = pathname === `/job/${job.id}`;

  return (
    <li
      className={cn(
        "group relative flex items-center justify-between rounded-md hover:bg-primary/10",
        isActive && "bg-primary/10",
      )}
    >
      <Link href={`/job/${job.id}`} className="flex-1 p-2">
        <div className="max-w-44 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
          {job.name}
        </div>
        <div className="text-xs text-muted-foreground">{job.type}</div>
      </Link>
      <div className={cn("flex items-center", isActive && "opacity-100")}>
        <OptionsMenu job={job} />
      </div>
    </li>
  );
};

export const OptionsMenu = ({ job }: { job: Job }) => {
  const utils = api.useUtils();
  const openShareDialog = useShareDialogStore((state) => state.openShareDialog);

  // Mutation for deleting the job
  const deleteMutation = api.job.delete.useMutation({
    onSuccess: () => {
      void utils.job.byUser.invalidate(); // Refresh the job list
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

  const handleShare = () => {
    openShareDialog(job.id);
  };

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <DropdownMenu>
          <span tabIndex={0} className="sr-only" />
          <Tooltip>
            <TooltipTrigger asChild tabIndex={-1}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Options"
                  className="hover:bg-inherit"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              <p>Options</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align="start"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem onSelect={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            {/* <DropdownMenuItem onSelect={handleRename}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onSelect={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
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
