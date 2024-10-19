import logging
from typing import List, Optional

from fastapi import HTTPException
from supabase._async.client import AsyncClient

from app.crud.crud_conformational_b_prediction import crud_conformational_b_prediction
from app.crud.crud_job import crud_job
from app.crud.crud_linear_b_prediction import crud_linear_b_prediction
from app.crud.crud_mhc_ii_prediction import crud_mhc_ii_prediction
from app.services.inference import run_netmhci_binding_affinity_classI
from app.services.postprocess import (
    postprocess_mhc_i_prediction,
    process_classI_results,
    process_conformational_b_prediction,
    process_linear_b_prediction,
    process_mhc_ii_prediction,
)
from app.services.preprocess import preprocess_protein_sequence

logger = logging.getLogger(__name__)


async def process_and_update_prediction(
    db: AsyncClient,
    user_id: str,
    job_id: str,
    prediction_type: str,
    sequence: Optional[str] = None,
    pdb_id: Optional[str] = None,  # Only needed for Conformational B
    chain: Optional[str] = None,  # Only needed for Conformational B
    is_structure_based: Optional[bool] = False,  # Only needed for Conformational B
    alleles: Optional[List[str]] = None,
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
        # predictions = run(
        #     input_objects=[sample],
        #     endpoint_name=settings.SAGEMAKER_ENDPOINT_NAME,
        #     model_type="single",
        # )

        # logger.info(predictions)

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
            # Step 1: Split protein sequence into peptides (preprocessing)
            peptides = preprocess_protein_sequence(sequence, prediction_type)

            # Step 2: Run NetMHCpan-4.1 binding affinity predictions (inference)
            netmhci_results = await run_netmhci_binding_affinity_classI(
                peptides, alleles
            )

            # Step 3: Process NetMHCpan-4.1 results (postprocessing)
            processed_results = await process_classI_results(netmhci_results)

            # Step 4: Process the results (postprocessing)
            await postprocess_mhc_i_prediction(
                db=db,
                job_id=job_id,
                results=processed_results,  # Passing results from inference
                user_id=user_id,
                prediction_type=prediction_type,
            )
        elif prediction_type == "mhc-ii":
            # Step 1: Split protein sequence into peptides
            peptides = preprocess_protein_sequence(sequence, prediction_type)

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
