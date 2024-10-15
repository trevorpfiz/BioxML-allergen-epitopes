"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { ConformationalBStructureResult } from "@epi/validators/epitopes";

import { DataTableColumnHeader } from "~/components/predictions/tables/prediction-column-header";

export const conformationalBColumns: ColumnDef<ConformationalBStructureResult>[] =
  [
    {
      accessorKey: "PDB_ID",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PDB ID" />
      ),
    },
    {
      accessorKey: "Chain",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chain" />
      ),
    },
    {
      accessorKey: "Residue_position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Residue Position" />
      ),
    },
    {
      accessorKey: "AA",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amino Acid" />
      ),
    },
    {
      accessorKey: "Epitope_score",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Epitope Score" />
      ),
    },
    {
      accessorKey: "N_glyco_label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="N-glycosylation" />
      ),
    },
  ];
