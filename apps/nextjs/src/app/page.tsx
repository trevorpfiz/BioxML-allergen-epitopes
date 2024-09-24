import Link from "next/link";

import { Button } from "@epi/ui/button";

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center bg-background text-foreground">
      <div className="container mt-12 flex flex-col items-center justify-center gap-4 py-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Epitope Prediction Platform
        </h1>
        <Button size={"lg"} asChild>
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </div>
    </main>
  );
}
