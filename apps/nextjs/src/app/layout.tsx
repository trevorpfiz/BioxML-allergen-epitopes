import "~/app/globals.css";

import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@epi/ui";
import { Toaster } from "@epi/ui/sonner";
import { ThemeProvider } from "@epi/ui/theme";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.NODE_ENV === "production"
      ? env.NEXT_PUBLIC_SITE_URL
      : "http://localhost:3000",
  ),
  title: "BioxML Epitope Prediction",
  description: "B-cell and T-cell epitope prediction platform.",
  openGraph: {
    title: "BioxML Epitope Prediction",
    description: "B-cell and T-cell epitope prediction platform.",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: "BioxML Epitope Prediction",
  },
  twitter: {
    card: "summary_large_image",
    site: "@trevorpfiz",
    creator: "@trevorpfiz",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "h-screen w-full bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
