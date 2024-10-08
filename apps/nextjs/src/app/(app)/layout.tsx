import { Toaster } from "@epi/ui/sonner";

import Header from "~/components/header";
import Sidebar from "~/components/sidebar";
import { ShareDialogStoreProvider } from "~/providers/share-dialog-store-provider";

// "The Supabase team has received reports of user metadata being cached across unique anonymous users as a result of Next.js static page rendering. For the best user experience, utilize dynamic page rendering." - https://supabase.com/docs/guides/auth/auth-anonymous
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShareDialogStoreProvider>
      <div className="relative z-0 flex h-full w-full overflow-hidden">
        <Sidebar />

        <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
          <main className="relative h-full w-full flex-1 overflow-auto">
            <div tabIndex={0} className="flex h-full flex-col">
              <div className="flex-1 overflow-hidden">
                <div className="relative h-full w-full overflow-y-auto">
                  <div className="flex flex-col md:pb-9">
                    <Header />

                    <div>{children}</div>
                  </div>
                </div>
              </div>

              {/* Fixed footer */}
              {/* <div>footer</div> */}
            </div>
          </main>
        </div>

        <Toaster richColors />
      </div>
    </ShareDialogStoreProvider>
  );
}
