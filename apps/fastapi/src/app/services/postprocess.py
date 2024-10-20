import logging
from datetime import datetime
from io import StringIO
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import HTTPException
from supabase import AsyncClient

from app.core.config import settings
from app.core.utils import generate_csv_key, read_s3_csv, upload_csv_to_s3
from app.crud.crud_mhc_i_prediction import crud_mhc_i_prediction
from app.crud.crud_mhc_ii_prediction import crud_mhc_ii_prediction
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
    Processes the Class I results returned by the IEDB API or similar prediction tool.
    - Extracts relevant peptide, allele, and affinity data.
    - Formats the results and calculates the best binding affinity.
    """
    peptide_data = {}

    # Check if there's an error in the results
    if isinstance(results, dict) and "error" in results:
        logger.error(f"Error in results: {results['error']}")
        raise HTTPException(status_code=400, detail=results["error"])

    for res in results:
        if "result" in res:
            # Check if the result is a list of dictionaries instead of a string
            if isinstance(res["result"], list):
                # Handle the case where the result is a list of dictionaries
                df = pd.DataFrame(
                    res["result"]
                )  # Directly convert the list of dicts to a DataFrame
            else:
                try:
                    # Handle the case where the result is a string
                    df = pd.read_csv(StringIO(res["result"]), sep="\t")
                except Exception as e:
                    logger.error(f"Error reading data for result {res}: {str(e)}")
                    raise HTTPException(
                        status_code=500, detail="Error processing results."
                    )

            # Check for required columns
            if {"peptide", "allele", "affinity"}.issubset(df.columns):
                for _, row in df.iterrows():
                    peptide = row["peptide"]
                    allele = row["allele"]
                    affinity = row["affinity"]  # Using 'affinity' instead of 'ic50'

                    peptide_data.setdefault(peptide, {"binding_affinities": []})
                    peptide_data[peptide]["binding_affinities"].append(
                        (allele, float(affinity))
                    )
            else:
                logger.warning(f"Unexpected columns in API response: {df.columns}")
        else:
            # Handle errors if any
            for peptide in res["peptides"]:
                peptide_data.setdefault(peptide, {"binding_affinities": []})
                logger.error(f"Error for peptide {peptide}: {res.get('error')}")

    # Format processed results
    processed_results = []
    for peptide, data in peptide_data.items():
        binding_affinities = data.get("binding_affinities", [])

        # Ensure binding_affinities is a list and each element is a tuple of (allele, affinity)
        if isinstance(binding_affinities, list) and all(
            isinstance(x, tuple) and len(x) == 2 for x in binding_affinities
        ):
            # Log for debugging
            logger.debug(
                f"Binding affinities for peptide {peptide}: {binding_affinities}"
            )

            binding_affinity_str = "|".join(
                [
                    f"{allele}={affinity:.2f} nM"
                    for allele, affinity in binding_affinities
                ]
            )
        else:
            logger.warning(
                f"Binding affinities for peptide {peptide} is not formatted correctly: {binding_affinities}"
            )
            binding_affinity_str = ""

        # Determine the best binding affinity (minimum affinity value)
        best_binding_affinity = (
            f"{min(binding_affinities, key=lambda x: x[1])}"
            if binding_affinities
            else ""
        )

        # Append the formatted result for this peptide
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


async def postprocess_mhc_ii_prediction(
    db: AsyncClient,
    job_id: str,
    results: List[MhcIIPredictionResult],  # Results from inference
    user_id: str,
    prediction_type: str,
):
    """
    Consolidated postprocessing function for MHC-II predictions.
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
    await crud_mhc_ii_prediction.update_result(
        db=db,
        job_id=job_id,
        result=processed_results,
        csv_download_url=f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}",
    )


async def process_classII_results(
    results: List[Dict[str, Any]],
) -> List[MhcIIPredictionResult]:
    """
    Processes the Class II results returned by the IEDB API or similar prediction tool.
    - Extracts relevant peptide, allele, and affinity data.
    - Formats the results and calculates the best binding affinity.
    """
    peptide_data = {}

    # Check if there's an error in the results
    if isinstance(results, dict) and "error" in results:
        logger.error(f"Error in results: {results['error']}")
        raise HTTPException(status_code=400, detail=results["error"])

    for res in results:
        if "result" in res:
            # Check if the result is a list of dictionaries instead of a string
            if isinstance(res["result"], list):
                # Handle the case where the result is a list of dictionaries
                df = pd.DataFrame(
                    res["result"]
                )  # Directly convert the list of dicts to a DataFrame
            else:
                try:
                    # Handle the case where the result is a string
                    df = pd.read_csv(StringIO(res["result"]), sep="\t")
                except Exception as e:
                    logger.error(f"Error reading data for result {res}: {str(e)}")
                    raise HTTPException(
                        status_code=500, detail="Error processing results."
                    )

            # Check for required columns in the results (adjust for class II)
            if {"peptide", "allele", "affinity"}.issubset(df.columns):
                for _, row in df.iterrows():
                    peptide = row["peptide"]
                    allele = row["allele"]
                    affinity = row["affinity"]

                    peptide_data.setdefault(peptide, {"binding_affinities": []})
                    peptide_data[peptide]["binding_affinities"].append(
                        (allele, float(affinity))
                    )
            else:
                logger.warning(f"Unexpected columns in API response: {df.columns}")
        else:
            # Handle errors if any
            for peptide in res["peptides"]:
                peptide_data.setdefault(peptide, {"binding_affinities": []})
                logger.error(f"Error for peptide {peptide}: {res.get('error')}")

    # Format processed results
    processed_results = []
    for peptide, data in peptide_data.items():
        binding_affinities = data.get("binding_affinities", [])

        # Ensure binding_affinities is a list and each element is a tuple of (allele, affinity)
        if isinstance(binding_affinities, list) and all(
            isinstance(x, tuple) and len(x) == 2 for x in binding_affinities
        ):
            logger.debug(
                f"Binding affinities for peptide {peptide}: {binding_affinities}"
            )

            binding_affinity_str = "|".join(
                [
                    f"{allele}={affinity:.2f} nM"
                    for allele, affinity in binding_affinities
                ]
            )
        else:
            logger.warning(
                f"Binding affinities for peptide {peptide} is not formatted correctly: {binding_affinities}"
            )
            binding_affinity_str = ""

        # Determine the best binding affinity (minimum affinity value)
        best_binding_affinity = (
            f"{min(binding_affinities, key=lambda x: x[1])}"
            if binding_affinities
            else ""
        )

        # Append the formatted result for this peptide
        processed_results.append(
            MhcIIPredictionResult(
                Peptide_Sequence=peptide,
                ClassII_MHC_Binding_Affinity=binding_affinity_str,
                Best_Binding_Affinity=best_binding_affinity,
            )
        )

    return processed_results
