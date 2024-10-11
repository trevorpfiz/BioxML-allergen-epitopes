import csv
import os
from typing import List

from fastapi import HTTPException

from app.schemas.conformational_b_prediction import PredictionResult


async def process_conformational_b_prediction(
    pdb_id: str,
    chain: str,
) -> List[PredictionResult]:
    """
    Process a conformational B prediction by reading a CSV file and saving results.
    """
    # Define the path to the CSV file
    csv_filename = f"{pdb_id}_{chain}_epitopes_score.csv"
    csv_path = os.path.join("data", csv_filename)

    if not os.path.exists(csv_path):
        raise HTTPException(
            status_code=404, detail="CSV file not found for given PDB ID and chain."
        )

    # Read CSV and process the results
    results = []
    with open(csv_path, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                result = PredictionResult(
                    PDB_ID=row["PDB_ID"],
                    Chain=row["Chain"],
                    Residue_position=int(row["Residue_position"]),
                    AA=row["AA"],
                    Epitope_score=float(row["Epitope_score"]),
                    N_glyco_label=int(row["N_glyco_label"]),
                )
                results.append(result)
            except ValueError:
                continue  # Skip invalid rows

    return results
