import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@epi/ui/button";

import Loading from "~/app/(app)/loading";
import JobsList from "~/components/jobs/jobs-list";
import { api, HydrateClient } from "~/trpc/server";

const Sidebar = () => {
  void api.job.byUser.prefetch();

  return (
    <HydrateClient>
      <div className="hidden h-full min-w-64 flex-shrink-0 overflow-x-hidden bg-muted md:block">
        <nav className="flex h-full w-full flex-col px-3">
          {/* New Job */}
          <div className="flex h-14 items-center justify-between">
            <Button
              asChild
              className="w-full justify-start border-primary/20 bg-muted shadow-none hover:bg-primary/10"
              variant="outline"
            >
              <Link href="/">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Prediction
              </Link>
            </Button>
          </div>

          {/* Jobs Scroll Section */}
          <div className="relative -mr-2 flex-1 flex-col overflow-y-auto pr-2 pt-2">
            <div className="space-y-4">
              <Suspense
                fallback={
                  <div className="flex w-full flex-col items-center justify-center gap-4">
                    <Loading />
                  </div>
                }
              >
                <JobsList />
              </Suspense>
            </div>
          </div>

          {/* Bottom */}
          {/* <div className="flex flex-col py-2">
            <p>bottom</p>
          </div> */}
        </nav>
      </div>
    </HydrateClient>
  );
};

export default Sidebar;
