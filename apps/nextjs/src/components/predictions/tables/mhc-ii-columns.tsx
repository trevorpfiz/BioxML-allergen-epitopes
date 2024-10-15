"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { MhcIIResult as BaseMhcIIResult } from "@epi/validators/epitopes";

import type { MhcIIResult } from "~/components/predictions/tables/mhc-peptide-dialog-cell";
import { MhcPeptideDialogCell } from "~/components/predictions/tables/mhc-peptide-dialog-cell";
import { DataTableColumnHeader } from "~/components/predictions/tables/prediction-column-header";

export const mhcIIColumns: ColumnDef<BaseMhcIIResult>[] = [
  {
    accessorKey: "Peptide_Sequence",
    meta: "Peptide Sequence",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peptide Sequence" />
    ),
    cell: ({ row }) => {
      const rowData = row.original;
      // add type to rowData
      const rowDataWithType: MhcIIResult = {
        ...rowData,
        type: "MHC-II",
      };
      return <MhcPeptideDialogCell rowData={rowDataWithType} />;
    },
  },
  {
    accessorKey: "ClassII_TCR_Recognition",
    meta: "TCR Recognition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TCR Recognition" />
    ),
  },
  {
    accessorKey: "Best_Binding_Affinity",
    meta: "Best Binding Affinity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Best Binding Affinity" />
    ),
  },
  {
    accessorKey: "Best_pMHC_Stability",
    meta: "Best pMHC Stability",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Best pMHC Stability" />
    ),
  },
];
