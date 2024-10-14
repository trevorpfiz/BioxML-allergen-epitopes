from typing import List

from fastapi import HTTPException

from app.core.config import settings
from app.core.utils import read_s3_csv
from app.schemas.conformational_b_prediction import PredictionResult
from app.schemas.linear_b_prediction import LBPredictionResult
from app.schemas.mhc_i_prediction import MhcIPredictionResult
from app.schemas.mhc_ii_prediction import MhcIIPredictionResult


async def process_conformational_b_prediction(
    pdb_id: str, chain: str
) -> List[PredictionResult]:
    """
    Process a conformational B prediction by reading a CSV file from S3 and validating results.
    """
    csv_filename = "3ob4_A_epitopes_score.csv"
    s3_key = f"data/{csv_filename}"  # The S3 key for the file

    # Use the utility function to read the CSV and validate rows
    results = read_s3_csv(settings.S3_BUCKET_NAME, s3_key, PredictionResult)

    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"CSV file not found in S3 for {pdb_id} and {chain}.",
        )

    return results


async def process_linear_b_prediction(sequence: str) -> List[LBPredictionResult]:
    """
    Process a Linear B prediction by reading a CSV file from S3 and validating results.
    """
    csv_filename = "lbc.csv"
    s3_key = f"data/{csv_filename}"  # The S3 key for the file

    # Use the utility function to read the CSV and validate rows
    results = read_s3_csv(settings.S3_BUCKET_NAME, s3_key, LBPredictionResult)

    if not results:
        raise HTTPException(
            status_code=404, detail=f"CSV file not found in S3 for sequence {sequence}."
        )

    return results


async def process_mhc_i_prediction(sequence: str) -> List[MhcIPredictionResult]:
    """
    Process an MHC-I prediction by reading a CSV file from S3 and validating results.
    """
    csv_filename = "class_I.csv"
    s3_key = f"data/{csv_filename}"  # The S3 key for the file

    # Use the utility function to read the CSV and validate rows
    results = read_s3_csv(settings.S3_BUCKET_NAME, s3_key, MhcIPredictionResult)

    if not results:
        raise HTTPException(
            status_code=404, detail=f"CSV file not found in S3 for sequence {sequence}."
        )

    return results


async def process_mhc_ii_prediction(sequence: str) -> List[MhcIIPredictionResult]:
    """
    Process an MHC-II prediction by reading a CSV file from S3 and validating results.
    """
    csv_filename = "class_II.csv"
    s3_key = f"data/{csv_filename}"  # The S3 key for the file

    # Use the utility function to read the CSV and validate rows
    results = read_s3_csv(settings.S3_BUCKET_NAME, s3_key, MhcIIPredictionResult)

    if not results:
        raise HTTPException(
            status_code=404, detail=f"CSV file not found in S3 for sequence {sequence}."
        )

    return results
