"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { LinearBResult } from "@epi/validators/epitopes";

import { DataTableColumnHeader } from "~/components/predictions/tables/prediction-column-header";

export const linearBColumns: ColumnDef<LinearBResult>[] = [
  {
    accessorKey: "Peptide_Sequence",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peptide Sequence" />
    ),
  },
  {
    accessorKey: "Linear_B_Cell_Immunogenicity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="LBC Immunogenicity" />
    ),
  },
  {
    accessorKey: "Linear_BCR_Recognition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BCR Recognition" />
    ),
  },
];
