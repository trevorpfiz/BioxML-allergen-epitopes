import { useMemo, useState } from "react";

import type {
  MhcIIResult as BaseMhcIIResult,
  MhcIResult as BaseMhcIResult,
} from "@epi/validators/epitopes";
import { Button } from "@epi/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@epi/ui/dialog";

import { allelesColumns } from "~/components/predictions/tables/alleles-columns";
import { AllelesDataTable } from "~/components/predictions/tables/alleles-data-table";
import { parseAlleleData } from "~/lib/utils";

export enum PeptideFields {
  TCR_RECOGNITION_I = "ClassI_TCR_Recognition",
  MHC_BINDING_AFFINITY_I = "ClassI_MHC_Binding_Affinity",
  PMHC_STABILITY_I = "ClassI_pMHC_Stability",

  TCR_RECOGNITION_II = "ClassII_TCR_Recognition",
  MHC_BINDING_AFFINITY_II = "ClassII_MHC_Binding_Affinity",
  PMHC_STABILITY_II = "ClassII_pMHC_Stability",
}

// Extend the existing MhcIResult with a discriminator
export type MhcIResult = BaseMhcIResult & {
  type: "MHC-I";
};

// Extend the existing MhcIIResult with a discriminator
export type MhcIIResult = BaseMhcIIResult & {
  type: "MHC-II";
};

interface PeptideDialogProps {
  rowData: MhcIResult | MhcIIResult;
}

export function MhcPeptideDialogCell({ rowData }: PeptideDialogProps) {
  const { Peptide_Sequence, Best_Binding_Affinity, Best_pMHC_Stability } =
    rowData;

  const [open, setOpen] = useState(false);

  // Extract values based on whether the rowData is MHC-I or MHC-II
  let tcrRecognition: number;
  let mhcBindingAffinity: string;
  let pmhcStability: string;

  if (rowData.type === "MHC-I") {
    tcrRecognition = rowData.ClassI_TCR_Recognition;
    mhcBindingAffinity = rowData.ClassI_MHC_Binding_Affinity;
    pmhcStability = rowData.ClassI_pMHC_Stability;
  } else {
    tcrRecognition = rowData.ClassII_TCR_Recognition;
    mhcBindingAffinity = rowData.ClassII_MHC_Binding_Affinity;
    pmhcStability = rowData.ClassII_pMHC_Stability;
  }

  const alleleData = useMemo(
    () => parseAlleleData(mhcBindingAffinity, pmhcStability),
    [mhcBindingAffinity, pmhcStability],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="items-center justify-start p-0 text-blue-500"
        >
          {Peptide_Sequence}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{Peptide_Sequence}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <dl>
                <div className="flex gap-1">
                  <dt>TCR Recognition:</dt>
                  <dd>{tcrRecognition}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>Best Binding Affinity:</dt>
                  <dd>{Best_Binding_Affinity}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>Best pMHC Stability:</dt>
                  <dd>{Best_pMHC_Stability}</dd>
                </div>
              </dl>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="gap-4 pt-4">
          {/* Alleles Table */}
          <div>
            <AllelesDataTable columns={allelesColumns} data={alleleData} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
