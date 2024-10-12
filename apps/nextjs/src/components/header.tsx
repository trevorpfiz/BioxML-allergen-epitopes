"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Upload } from "lucide-react";

import type { PredictionType } from "@epi/db/schema";
import { Button } from "@epi/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@epi/ui/select";

import { UserButton } from "~/components/auth/user-button";
import { usePredictionTypeStore } from "~/providers/prediction-type-store-provider";
import { useShareDialogStore } from "~/providers/share-dialog-store-provider";
import { createClient } from "~/utils/supabase/client";

export default function Header() {
  const params = useParams<{ jobId?: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  const selectedType = usePredictionTypeStore((state) => state.selectedType);
  const setSelectedType = usePredictionTypeStore(
    (state) => state.setSelectedType,
  );
  const openShareDialog = useShareDialogStore((state) => state.openShareDialog);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error);
      } else {
        setUser(data.user);
      }
    };

    void getUser();

    // Initialize selectedType from URL search params if available
    const typeFromURL = searchParams.get("type") as PredictionType | null;
    if (
      typeFromURL &&
      ["conformational-b", "linear-b", "mhc-i", "mhc-ii"].includes(typeFromURL)
    ) {
      setSelectedType(typeFromURL);
    }
  }, [searchParams, setSelectedType, supabase.auth]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handleTypeChange = (value: PredictionType) => {
    setSelectedType(value);
    // Update the URL search params
    router.push(`${pathname}?${createQueryString("type", value)}`);
  };

  const handleShareClick = () => {
    const currentJobId = params.jobId;
    openShareDialog(currentJobId ?? "");
  };

  return (
    <header className="sticky top-0 z-10 mb-1.5 flex h-14 items-center justify-between bg-background p-3 font-semibold">
      <div className="flex items-center gap-0">
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Epitope Predictions</SelectLabel>
              <SelectItem value="conformational-b">Conformational B</SelectItem>
              <SelectItem value="linear-b">Linear B</SelectItem>
              <SelectItem value="mhc-i">MHC I</SelectItem>
              <SelectItem value="mhc-ii">MHC II</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pr-1 leading-[0]">
        {params.jobId && (
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleShareClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}

        <UserButton user={user} />
      </div>
    </header>
  );
}
