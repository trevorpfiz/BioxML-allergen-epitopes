"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { MhcIIResult } from "@epi/validators/epitopes";

import { DataTableColumnHeader } from "~/components/predictions/tables/prediction-column-header";

export const mhcIIColumns: ColumnDef<MhcIIResult>[] = [
  {
    accessorKey: "Peptide_Sequence",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peptide Sequence" />
    ),
  },
  {
    accessorKey: "ClassI_TCR_Recognition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TCR Recognition" />
    ),
  },
  {
    accessorKey: "Best_Binding_Affinity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Best Binding Affinity" />
    ),
  },
  {
    accessorKey: "Best_pMHC_Stability",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Best pMHC Stability" />
    ),
  },
];
