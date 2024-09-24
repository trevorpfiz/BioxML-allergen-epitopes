import { FcGoogle } from "react-icons/fc";

import { Button } from "@epi/ui/button";

import { signInWithGoogle } from "~/lib/actions/auth";

export const Social = () => {
  return (
    <form className="flex w-full flex-col items-center gap-2">
      <Button
        size="lg"
        className="flex w-full flex-row items-center justify-center gap-2"
        variant="outline"
        formAction={signInWithGoogle}
      >
        <FcGoogle className="h-5 w-5" />
        <span className="font-medium text-muted-foreground">
          Continue with Google
        </span>
      </Button>
    </form>
  );
};
