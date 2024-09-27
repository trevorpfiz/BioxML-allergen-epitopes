"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "~/components/peptides/tables/similarity-column-header";

export interface SimilarityData {
  PDB_ID_1: string;
  aa_1: string;
  chain_1: string;
  pos_1: number;
  PDB_ID_2: string;
  aa_2: string;
  chain_2: string;
  pos_2: number;
  score: number;
}

export const columns: ColumnDef<SimilarityData>[] = [
  {
    accessorKey: "PDB_ID_1",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PDB ID 1" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "aa_1",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amino Acid 1" />
    ),
  },
  {
    accessorKey: "chain_1",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chain 1" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "pos_1",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position 1" />
    ),
    cell: ({ row }) => <span>{row.getValue("pos_1")}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "PDB_ID_2",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PDB ID 2" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "aa_2",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amino Acid 2" />
    ),
  },
  {
    accessorKey: "chain_2",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chain 2" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "pos_2",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position 2" />
    ),
    cell: ({ row }) => <span>{row.getValue("pos_2")}</span>,
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Similarity Score" />
    ),
    cell: ({ row }) => <span>{row.getValue("score")}</span>,
  },
];
