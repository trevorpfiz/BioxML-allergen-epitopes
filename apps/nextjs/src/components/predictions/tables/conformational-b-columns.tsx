"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { ConformationalBResult } from "@epi/validators/epitopes";

import { DataTableColumnHeader } from "~/components/predictions/tables/prediction-column-header";

export const conformationalBStructureColumns: ColumnDef<ConformationalBResult>[] =
  [
    {
      accessorKey: "PDB_ID",
      meta: "PDB ID",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PDB ID" />
      ),
    },
    {
      accessorKey: "Chain",
      meta: "Chain",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chain" />
      ),
    },
    {
      accessorKey: "Residue_position",
      meta: "Residue Position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Residue Position" />
      ),
    },
    {
      accessorKey: "AA",
      meta: "Amino Acid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amino Acid" />
      ),
    },
    {
      accessorKey: "Epitope_score",
      meta: "Epitope Score",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Epitope Score" />
      ),
    },
    {
      accessorKey: "N_glyco_label",
      meta: "N-glycosylation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="N-glycosylation" />
      ),
    },
  ];

// Columns for sequence-based predictions
export const conformationalBSequenceColumns: ColumnDef<ConformationalBResult>[] =
  [
    {
      accessorKey: "Residue_position",
      meta: "Residue Position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Residue Position" />
      ),
    },
    {
      accessorKey: "AA",
      meta: "Amino Acid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amino Acid" />
      ),
    },
    {
      accessorKey: "Epitope_score",
      meta: "Epitope Score",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Epitope Score" />
      ),
    },
    {
      accessorKey: "N_glyco_label",
      meta: "N-glycosylation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="N-glycosylation" />
      ),
    },
  ];
