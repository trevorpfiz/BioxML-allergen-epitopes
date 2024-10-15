"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "~/components/predictions/tables/prediction-column-header";

interface AlleleData {
  HLA_Allele: string;
  MHC_Binding_Affinity: string;
  pMHC_Stability: string;
}

export const allelesColumns: ColumnDef<AlleleData>[] = [
  {
    accessorKey: "HLA_Allele",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="HLA Allele" />
    ),
  },
  {
    accessorKey: "MHC_Binding_Affinity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MHC Binding Affinity" />
    ),
  },
  {
    accessorKey: "pMHC_Stability",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="pMHC Stability" />
    ),
  },
];
