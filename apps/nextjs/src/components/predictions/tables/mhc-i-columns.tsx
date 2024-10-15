"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { MhcIResult as BaseMhcIResult } from "@epi/validators/epitopes";

import type { MhcIResult } from "~/components/predictions/tables/mhc-peptide-dialog-cell";
import { MhcPeptideDialogCell } from "~/components/predictions/tables/mhc-peptide-dialog-cell";
import { DataTableColumnHeader } from "~/components/predictions/tables/prediction-column-header";

export const mhcIColumns: ColumnDef<BaseMhcIResult>[] = [
  {
    accessorKey: "Peptide_Sequence",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peptide Sequence" />
    ),
    cell: ({ row }) => {
      const rowData = row.original;
      // add type to rowData
      const rowDataWithType: MhcIResult = {
        ...rowData,
        type: "MHC-I",
      };
      return <MhcPeptideDialogCell rowData={rowDataWithType} />;
    },
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
