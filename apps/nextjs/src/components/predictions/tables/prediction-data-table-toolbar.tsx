"use client";

import type { Table } from "@tanstack/react-table";
import { json2csv } from "json-2-csv";
import { Download } from "lucide-react";

import { Button } from "@epi/ui/button";
import { toast } from "@epi/ui/sonner";

import { DataTableViewOptions } from "~/components/predictions/tables/prediction-data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  rawData: TData[];
}

export function DataTableToolbar<TData>({
  table,
  rawData,
}: DataTableToolbarProps<TData>) {
  const downloadCSV = () => {
    try {
      // Convert JSON to CSV using json-2-csv
      const csv = json2csv(rawData as object[], {
        expandNestedObjects: true,
      });

      // Create a Blob from the CSV content and trigger a download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "prediction_data.csv";
      link.click();
    } catch (error) {
      console.error("Error generating CSV:", error);
      toast.error("Error generating CSV");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Button
          variant="default"
          size="sm"
          className="flex h-8 items-center"
          aria-label="Download CSV"
          onClick={downloadCSV}
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
