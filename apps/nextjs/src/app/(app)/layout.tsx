import { Toaster } from "@epi/ui/sonner";

import Navbar from "~/components/navbar";
import Sidebar from "~/components/sidebar";

// "The Supabase team has received reports of user metadata being cached across unique anonymous users as a result of Next.js static page rendering. For the best user experience, utilize dynamic page rendering." - https://supabase.com/docs/guides/auth/auth-anonymous
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 pt-2 md:p-8">
          <Navbar />
          {children}
        </main>
      </div>
      <Toaster richColors />
    </main>
  );
}
