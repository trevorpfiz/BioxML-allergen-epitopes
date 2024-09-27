import { Cog, Cpu, HomeIcon } from "lucide-react";

import type { SidebarLink } from "~/components/sidebar-items";

interface AdditionalLinks {
  title: string;
  links: SidebarLink[];
}

export const defaultLinks: SidebarLink[] = [
  { href: "/dashboard", title: "Home", icon: HomeIcon },
  { href: "/settings", title: "Settings", icon: Cog },
];

export const additionalLinks: AdditionalLinks[] = [
  {
    title: "Linear B-cell",
    links: [
      {
        href: "/linear-b/prediction",
        title: "Prediction",
        icon: Cpu,
      },
    ],
  },
  {
    title: "Conformational B-cell",
    links: [
      {
        href: "/conformational-b/sequence-based",
        title: "Sequence-based",
        icon: Cpu,
      },
      {
        href: "/conformational-b/structure-based",
        title: "Structure-based",
        icon: Cpu,
      },
      {
        href: "/conformational-b/compare",
        title: "Compare",
        icon: Cpu,
      },
    ],
  },
  {
    title: "MHC-I",
    links: [
      {
        href: "/mhc-i/prediction",
        title: "Prediction",
        icon: Cpu,
      },
    ],
  },
  {
    title: "MHC-II",
    links: [
      {
        href: "/mhc-ii/prediction",
        title: "Prediction",
        icon: Cpu,
      },
    ],
  },
];
