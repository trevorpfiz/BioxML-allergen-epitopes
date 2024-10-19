import logging
from datetime import datetime
from io import StringIO
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import HTTPException
from supabase import AsyncClient

from app.core.config import settings
from app.core.utils import generate_csv_key, read_s3_csv, upload_csv_to_s3
from app.crud import crud_mhc_i_prediction
from app.schemas.conformational_b_prediction import PredictionResult
from app.schemas.linear_b_prediction import LBPredictionResult
from app.schemas.mhc_i_prediction import MhcIPredictionResult
from app.schemas.mhc_ii_prediction import MhcIIPredictionResult

logger = logging.getLogger(__name__)


async def process_conformational_b_prediction(
    pdb_id: Optional[str] = None,
    chain: Optional[str] = None,
    sequence: Optional[str] = None,
) -> List[PredictionResult]:
    """
    Process a conformational B prediction by reading a CSV file from S3 and validating results.
    """
    if pdb_id:
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
    elif sequence:
        csv_filename = "AAK96887-1d.csv"
        s3_key = f"data/{csv_filename}"  # The S3 key for the file

        # Use the utility function to read the CSV and validate rows
        results = read_s3_csv(settings.S3_BUCKET_NAME, s3_key, PredictionResult)

        if not results:
            raise HTTPException(
                status_code=404,
                detail=f"CSV file not found in S3 for sequence {sequence}.",
            )

        return results
    else:
        raise HTTPException(status_code=400, detail="No sequence or PDB ID provided.")


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


# MHC-I Predictions
async def process_classI_results(
    results: List[Dict[str, Any]],
) -> List[MhcIPredictionResult]:
    """
    Processes the Class I results returned by the IEDB API.
    """
    peptide_data = {}

    for res in results:
        if "result" in res:
            try:
                df = pd.read_csv(StringIO(res["result"]), sep="\t")
                if {"peptide", "allele", "ic50"}.issubset(df.columns):
                    for _, row in df.iterrows():
                        peptide = row["peptide"]
                        allele = row["allele"]
                        ic50 = row["ic50"]
                        peptide_data.setdefault(peptide, {"binding_affinities": []})
                        peptide_data[peptide]["binding_affinities"].append(
                            (allele, float(ic50))
                        )
                else:
                    logger.warning(f"Unexpected columns in API response: {df.columns}")
            except pd.errors.EmptyDataError:
                logger.warning(
                    f"Received empty data from API for allele {res['allele']} and length {res['length']}."
                )
        else:
            # Handle errors if any
            for peptide in res["peptides"]:
                peptide_data.setdefault(peptide, {"binding_affinities": []})
                logger.error(f"Error for peptide {peptide}: {res.get('error')}")

    # Format processed results
    processed_results = []
    for peptide, data in peptide_data.items():
        binding_affinities = data.get("binding_affinities", [])
        binding_affinity_str = "|".join(
            [f"{allele}={ic50} nM" for allele, ic50 in binding_affinities]
        )
        best_binding_affinity = (
            f"{min(binding_affinities, key=lambda x: x[1])}"
            if binding_affinities
            else ""
        )

        processed_results.append(
            MhcIPredictionResult(
                Peptide_Sequence=peptide,
                ClassI_MHC_Binding_Affinity=binding_affinity_str,
                Best_Binding_Affinity=best_binding_affinity,
            )
        )

    return processed_results


async def postprocess_mhc_i_prediction(
    db: AsyncClient,
    job_id: str,
    results: List[MhcIPredictionResult],  # Results from inference
    user_id: str,
    prediction_type: str,
):
    """
    Consolidated postprocessing function for MHC-I predictions.
    - Processes the prediction results
    - Uploads results as a CSV to S3
    - Updates the database with the results and CSV download URL
    """
    # Step 1: Process the results
    processed_results = results

    # Step 2: Generate a unique CSV filename and upload to S3
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    s3_key = generate_csv_key(
        user_id=user_id,
        job_id=job_id,
        timestamp=timestamp,
        prediction_type=prediction_type,
    )
    await upload_csv_to_s3(processed_results, s3_key)

    # Step 3: Update the database with results and CSV URL
    await crud_mhc_i_prediction.update_result(
        db=db,
        job_id=job_id,
        result=processed_results,
        csv_download_url=f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}",
    )


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
