from fastapi import HTTPException
from supabase._async.client import AsyncClient

from app.crud.crud_conformational_b_prediction import crud_conformational_b_prediction
from app.crud.crud_job import crud_job
from app.services.conformational_b import process_conformational_b_prediction


async def process_and_update_prediction(
    job_id: str,
    pdb_id: str,
    chain: str,
    prediction_type: str,
    db: AsyncClient,
):
    """
    Background task to process a prediction based on its type and update the database.
    """
    try:
        # Update job status to 'running'
        await crud_job.update_status(db=db, id=job_id, status="running")

        # Process the prediction based on its type
        if prediction_type == "conformational-b":
            results = await process_conformational_b_prediction(
                pdb_id=pdb_id, chain=chain
            )
            await crud_conformational_b_prediction.update_result(
                db=db, job_id=job_id, result=results
            )
        # elif prediction_type == "linear-b":
        #     results = await process_linear_b_prediction(pdb_id=pdb_id, chain=chain)
        #     await crud_linear_b_prediction.update_result(
        #         db=db, prediction_id=prediction_id, result=results
        #     )
        # elif prediction_type == "mhc-i":
        #     results = await process_mhc_i_prediction(pdb_id=pdb_id, chain=chain)
        #     await crud_mhc_i_prediction.update_result(
        #         db=db, prediction_id=prediction_id, result=results
        #     )
        # elif prediction_type == "mhc-ii":
        #     results = await process_mhc_ii_prediction(pdb_id=pdb_id, chain=chain)
        #     await crud_mhc_ii_prediction.update_result(
        #         db=db, prediction_id=prediction_id, result=results
        #     )
        else:
            raise HTTPException(status_code=400, detail="Unsupported prediction type.")

        # Update job status to 'completed'
        await crud_job.update_status(db=db, id=job_id, status="completed")
    except Exception as e:
        # Log the error (consider using a logger)
        print(f"Error processing prediction {job_id}: {e}")

        # Update job status to 'failed'
        await crud_job.update_status(db=db, id=job_id, status="failed")
