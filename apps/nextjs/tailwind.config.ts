import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "@epi/tailwind-config/web";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [...baseConfig.content, "../../packages/ui/src/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      colors: {
        "epitope-low":
          "rgb(var(--epitope-low-r), var(--epitope-low-g), var(--epitope-low-b))",
        "epitope-mid":
          "rgb(var(--epitope-mid-r), var(--epitope-mid-g), var(--epitope-mid-b))",
        "epitope-high":
          "rgb(var(--epitope-high-r), var(--epitope-high-g), var(--epitope-high-b))",
      },
    },
  },
} satisfies Config;
