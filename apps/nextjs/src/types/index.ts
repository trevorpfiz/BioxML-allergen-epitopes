export interface EpitopeData {
  PDB_ID: string;
  Chain: string;
  Residue_position: number;
  AA: string;
  Epitope_score: number;
  N_glyco_label?: number;
}
