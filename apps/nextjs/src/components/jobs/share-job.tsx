"use client";

import { useEffect, useState } from "react";
import { Copy, Link, Loader2 } from "lucide-react";

import { cn } from "@epi/ui";
import { Button } from "@epi/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@epi/ui/dialog";
import { Input } from "@epi/ui/input";
import { toast } from "@epi/ui/sonner";

import { env } from "~/env";
import { useShareDialogStore } from "~/providers/share-dialog-store-provider";
import { api } from "~/trpc/react";

export const ShareDialog = () => {
  const { isOpen, jobId, closeShareDialog } = useShareDialogStore((state) => ({
    isOpen: state.isOpen,
    jobId: state.jobId,
    closeShareDialog: state.closeShareDialog,
  }));

  const utils = api.useUtils();

  const [isCopied, setIsCopied] = useState(false);
  const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout | null>(null);

  const shareUrl =
    env.NODE_ENV === "production"
      ? `${env.NEXT_PUBLIC_ROOT_DOMAIN}/share/`
      : `http://localhost:3000/share/`;

  // Fetch the job details including the shareToken on open
  const { isLoading, isError, data } = api.job.byId.useQuery(
    { id: jobId ?? "" }, // jobId is guaranteed to be not null when isOpen is true
    {
      enabled: isOpen && !!jobId,
    },
  );

  const shareMutation = api.job.generateShareLink.useMutation({
    onSuccess: () => {
      void utils.job.byId.invalidate({ id: jobId ?? "" });
    },
    onError: () => {
      toast.error("Failed to generate shareable link.");
    },
  });

  const handleCreateLink = () => {
    if (jobId) {
      shareMutation.mutate({ id: jobId });
    }
  };

  const handleCopyLink = () => {
    const link = `${shareUrl}${data?.job.shareToken}`;
    if (link) {
      void navigator.clipboard.writeText(link);
      setIsCopied(true);

      // Disable the button for 2 seconds and reset
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      setCopyTimeout(timeout);
    }
  };

  // Clear timeout if the component unmounts to avoid memory leaks
  useEffect(() => {
    return () => {
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
    };
  }, [copyTimeout]);

  const handleClose = () => {
    closeShareDialog();
    setIsCopied(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader tabIndex={0}>
          <DialogTitle>Share public link to job</DialogTitle>
          <DialogDescription>
            Your jobs you add after sharing stay private.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        ) : isError ? (
          <div>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load job details. Please try again.
            </DialogDescription>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                value={
                  data?.job.shareToken
                    ? `${shareUrl}${data.job.shareToken}`
                    : `${shareUrl}...`
                }
                readOnly
                className={cn(
                  "w-full",
                  !data?.job.shareToken && "text-muted-foreground",
                )}
              />
            </div>

            {!data?.job.shareToken ? (
              shareMutation.isPending ? (
                <Button
                  disabled
                  size="sm"
                  className="flex items-center space-x-2 px-3"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="flex items-center space-x-2 px-3"
                  onClick={handleCreateLink}
                >
                  <Link className="mr-2 h-4 w-4" />
                  Create link
                </Button>
              )
            ) : (
              <Button
                type="button"
                size="sm"
                className="flex items-center space-x-2 px-3"
                onClick={handleCopyLink}
                disabled={isCopied}
              >
                <Copy className="mr-2 h-4 w-4" />
                {isCopied ? "Copied" : "Copy Link"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
