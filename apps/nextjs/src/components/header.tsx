"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Upload } from "lucide-react";

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
import { createClient } from "~/utils/supabase/client";

export default function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

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
  }, [supabase.auth]);

  const isJobPage = /^\/job\/[0-9a-fA-F-]{36}$/.test(pathname);

  return (
    <header className="sticky top-0 z-10 mb-1.5 flex h-14 items-center justify-between bg-background p-3 font-semibold">
      <div className="flex items-center gap-0">
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Epitope Predictions</SelectLabel>
              <SelectItem value="linear-b">Linear B</SelectItem>
              <SelectItem value="conformational-b">Conformational B</SelectItem>
              <SelectItem value="mhc-i">MHC I</SelectItem>
              <SelectItem value="mhc-ii">MHC II</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pr-1 leading-[0]">
        {isJobPage && (
          <Button variant="outline" className="rounded-full">
            <Upload className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}

        <UserButton user={user} />
      </div>
    </header>
  );
}
