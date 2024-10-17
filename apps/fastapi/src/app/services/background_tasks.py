import logging
from typing import Optional

from fastapi import HTTPException
from supabase._async.client import AsyncClient

from app.core.config import settings
from app.crud.crud_conformational_b_prediction import crud_conformational_b_prediction
from app.crud.crud_job import crud_job
from app.crud.crud_linear_b_prediction import crud_linear_b_prediction
from app.crud.crud_mhc_i_prediction import crud_mhc_i_prediction
from app.crud.crud_mhc_ii_prediction import crud_mhc_ii_prediction
from app.services.pipeline import run
from app.services.postprocess import (
    process_conformational_b_prediction,
    process_linear_b_prediction,
    process_mhc_i_prediction,
    process_mhc_ii_prediction,
)

logger = logging.getLogger(__name__)


async def process_and_update_prediction(
    job_id: str,
    prediction_type: str,
    db: AsyncClient,
    sequence: Optional[str] = None,
    pdb_id: Optional[str] = None,  # Only needed for Conformational B
    chain: Optional[str] = None,  # Only needed for Conformational B
    is_structure_based: Optional[bool] = False,  # Only needed for Conformational B
):
    """
    Background task to process a prediction based on its type and update the database.
    """
    try:
        # Update job status to 'running'
        await crud_job.update_status(db=db, id=job_id, status="running")

        # Sample input
        glp_1_receptor = "MAGAPGPLRLALLLLGMVGRAGPRPQGATVSLWETVQKWREYRRQCQRSLTEDPPPATDLFCNRTFDEYACWPDGEPGSFVNVSCPWYLPWASSVPQGHVYRFCTAEGLWLQKDNSSLPWRDLSECEESKRGERSSPEEQLLFLYIIYTVGYALSFSALVIASAILLGFRHLHCTRNYIHLNLFASFILRALSVFIKDAALKWMYSTAAQQHQWDGLLSYQDSLSCRLVFLLMQYCVAANYYWLLVEGVYLYTLLAFSVLSEQWIFRLYVSIGWGVPLLFVVPWGIVKYLYEDEGCWTRNSNMNYWLIIRLPILFAIGVNFLIFVRVICIVVSKLKANLMCKTDIKCRLAKSTLTLIPLLGTHEVIFAFVMDEHARGTLRFIKLFTELSFTSFQGLMVAILYCFVNNEVQLEFRKSWERWRLEHLHIQRDSSMKPLKCPTSSLSSGATAGSSMYTATCQASCS"
        sample = {"inputs": glp_1_receptor}

        # Run prediction pipeline
        predictions = run(
            input_objects=[sample],
            endpoint_name=settings.SAGEMAKER_ENDPOINT_NAME,
            model_type="single",
        )

        logger.info(predictions)

        # Process the prediction based on its type
        if prediction_type == "conformational-b":
            if is_structure_based:
                results = await process_conformational_b_prediction(
                    pdb_id=pdb_id, chain=chain
                )
            else:
                results = await process_conformational_b_prediction(sequence=sequence)

            await crud_conformational_b_prediction.update_result(
                db=db, job_id=job_id, result=results
            )
        elif prediction_type == "linear-b":
            results = await process_linear_b_prediction(sequence=sequence)
            await crud_linear_b_prediction.update_result(
                db=db, job_id=job_id, result=results
            )
        elif prediction_type == "mhc-i":
            results = await process_mhc_i_prediction(sequence=sequence)
            await crud_mhc_i_prediction.update_result(
                db=db, job_id=job_id, result=results
            )
        elif prediction_type == "mhc-ii":
            results = await process_mhc_ii_prediction(sequence=sequence)
            await crud_mhc_ii_prediction.update_result(
                db=db, job_id=job_id, result=results
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported prediction type.")

        # Update job status to 'completed'
        await crud_job.update_status(db=db, id=job_id, status="completed")
    except Exception as e:
        # Log the error (consider using a logger)
        logger.error(f"Error processing prediction {job_id}: {e}")

        # Update job status to 'failed'
        await crud_job.update_status(db=db, id=job_id, status="failed")
