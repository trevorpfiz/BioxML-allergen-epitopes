import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback } from "@epi/ui/avatar";

import SidebarItems from "~/components/sidebar-items";
import { DEFAULT_AUTH_ROUTE } from "~/config/routes";
import { getNameFromUser } from "~/lib/utils";
import { createClient } from "~/utils/supabase/server";

const Sidebar = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user.id) {
    console.log("Error getting user:", error);
    // redirect(DEFAULT_AUTH_ROUTE);
  }

  return (
    <aside className="hidden h-screen min-w-52 border-r border-border bg-muted p-4 pt-8 shadow-inner md:block">
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-4">
          <h3 className="ml-4 text-lg font-semibold">Epitope Prediction</h3>
          <SidebarItems />
        </div>
        <UserDetails user={data.user} />
      </div>
    </aside>
  );
};

export default Sidebar;

const UserDetails = ({ user }: { user: User }) => {
  const name = getNameFromUser(user);
  const displayEmail = user.email ?? "Guest";
  // const initials = name
  //   .split(" ")
  //   .map((word) => word[0]?.toUpperCase())
  //   .join("")
  //   .slice(0, 2);

  return (
    <Link href="/account">
      <div className="flex w-full items-center justify-between border-t border-border px-2 pt-4">
        <div className="text-muted-foreground">
          <p className="text-xs">{name}</p>
          <p className="pr-4 text-xs font-light">{displayEmail}</p>
        </div>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="border-2 border-border bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
            {/* {initials || ""} */}
          </AvatarFallback>
        </Avatar>
      </div>
    </Link>
  );
};
