import csv
import os
from typing import List

from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas.conformational_b_prediction import PredictionResult
from app.schemas.linear_b_prediction import LBPredictionResult
from app.schemas.mhc_i_prediction import MhcIPredictionResult
from app.schemas.mhc_ii_prediction import MhcIIPredictionResult


async def process_conformational_b_prediction(
    pdb_id: str,
    chain: str,
) -> List[PredictionResult]:
    """
    Process a conformational B prediction by reading a CSV file and saving results.
    """
    # Define the path to the CSV file
    csv_filename = "3ob4_A_epitopes_score.csv"
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
                # Validate each row with Pydantic
                result = PredictionResult.model_validate(row)
                results.append(result)
            except (ValidationError, ValueError) as e:
                # Handle validation errors (log or continue)
                print(f"Skipping invalid row due to error: {e}")
                continue

    return results


async def process_linear_b_prediction(sequence: str) -> List[LBPredictionResult]:
    """
    Process a Linear B prediction by reading a CSV file and saving results.
    """
    # Define the path to the CSV file
    csv_filename = "lbc.csv"
    csv_path = os.path.join("data", csv_filename)

    if not os.path.exists(csv_path):
        raise HTTPException(
            status_code=404, detail="CSV file not found for given sequence."
        )

    # Read CSV and process the results
    results = []
    with open(csv_path, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                # Validate each row with Pydantic
                result = LBPredictionResult.model_validate(row)
                results.append(result)
            except (ValidationError, ValueError) as e:
                # Handle validation errors (log or continue)
                print(f"Skipping invalid row due to error: {e}")
                continue

    return results


async def process_mhc_i_prediction(sequence: str) -> List[MhcIPredictionResult]:
    """
    Process an MHC-I prediction by reading a CSV file and saving results.
    """
    # Define the path to the CSV file
    csv_filename = "class_I.csv"
    csv_path = os.path.join("data", csv_filename)

    if not os.path.exists(csv_path):
        raise HTTPException(
            status_code=404, detail="CSV file not found for given sequence."
        )

    # Read CSV and process the results
    results = []
    with open(csv_path, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                # Validate each row with Pydantic
                result = MhcIPredictionResult.model_validate(row)
                results.append(result)
            except (ValidationError, ValueError) as e:
                # Handle validation errors (log or continue)
                print(f"Skipping invalid row due to error: {e}")
                continue

    return results


async def process_mhc_ii_prediction(sequence: str) -> List[MhcIIPredictionResult]:
    """
    Process an MHC-II prediction by reading a CSV file and saving results.
    """
    # Define the path to the CSV file
    csv_filename = "class_II.csv"
    csv_path = os.path.join("data", csv_filename)

    if not os.path.exists(csv_path):
        raise HTTPException(
            status_code=404, detail="CSV file not found for given sequence."
        )

    # Read CSV and process the results
    results = []
    with open(csv_path, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                # Validate each row with Pydantic
                result = MhcIIPredictionResult.model_validate(row)
                results.append(result)
            except (ValidationError, ValueError) as e:
                # Handle validation errors (log or continue)
                print(f"Skipping invalid row due to error: {e}")
                continue

    return results
