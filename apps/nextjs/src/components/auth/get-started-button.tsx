"use client";

import { useRouter } from "next/navigation";

interface GetStartedButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

export const GetStartedButton = ({
  children,
  mode = "redirect",
}: GetStartedButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push("/signup");
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === "Space") {
      onClick();
      event.preventDefault();
    }
  };

  if (mode === "modal") {
    return <span>TODO: Implement Modal</span>;
  }

  return (
    <span
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="cursor-pointer text-ellipsis text-blue-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {children}
    </span>
  );
};
