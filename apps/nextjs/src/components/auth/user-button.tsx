import type { User } from "@supabase/supabase-js";

import { Avatar, AvatarFallback, AvatarImage } from "@epi/ui/avatar";
import { Button } from "@epi/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@epi/ui/dropdown-menu";

import { getNameFromUser } from "~/lib/utils";

function UserButton({ user }: { user: User | null }) {
  if (!user) {
    return null;
  }

  const name = getNameFromUser(user);
  const displayEmail = user.email ?? "Guest";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="border-2 border-border bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              {/* {initials || ""} */}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>test</DropdownMenuItem>
          <DropdownMenuItem>test</DropdownMenuItem>
          <DropdownMenuItem>test</DropdownMenuItem>
          <DropdownMenuItem>test</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserButton };
