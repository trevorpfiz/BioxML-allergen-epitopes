from typing import List, Optional

from fastapi import HTTPException
from supabase._async.client import AsyncClient

from app.crud.base import CRUDBase
from app.crud.crud_job import crud_job
from app.schemas.auth import UserIn
from app.schemas.conformational_b_prediction import (
    ConformationalBPrediction,
    ConformationalBPredictionCreate,
    ConformationalBPredictionUpdate,
    PredictionResult,
)


class CRUDConformationalBPrediction(
    CRUDBase[
        ConformationalBPrediction,
        ConformationalBPredictionCreate,
        ConformationalBPredictionUpdate,
    ]
):
    async def create(
        self, db: AsyncClient, *, obj_in: ConformationalBPredictionCreate, user: UserIn
    ) -> ConformationalBPrediction:
        # Verify job exists and belongs to user
        job = await crud_job.get(db=db, id=obj_in.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if job.profile_id != user.id:
            raise HTTPException(
                status_code=403, detail="Not authorized to add prediction to this job"
            )

        # Insert the prediction with structured result data
        prediction_data = obj_in.model_dump()
        prediction_data["result"] = [
            result.model_dump() for result in obj_in.result
        ]  # Store result as jsonb

        response = (
            await db.table(self.model.table_name).insert(prediction_data).execute()
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create prediction")

        created_prediction = response.data[0]
        return self.model(**created_prediction)

    async def update_result(
        self,
        db: AsyncClient,
        *,
        job_id: str,
        result: List[PredictionResult],
        # csv_download_url: str,
    ) -> ConformationalBPrediction:
        prediction = await self.get_by_job_id(db=db, job_id=job_id)
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")

        # Update the result field
        updated_prediction = (
            await db.table(self.model.table_name)
            .update(
                {
                    "result": [res.model_dump() for res in result],
                    # "csv_download_url": csv_download_url,
                }
            )
            .eq("job_id", job_id)
            .execute()
        )
        if not updated_prediction.data:
            raise HTTPException(status_code=500, detail="Failed to update prediction")

        return self.model(**updated_prediction.data[0])

    async def get_by_job_id(
        self, db: AsyncClient, job_id: str
    ) -> Optional[ConformationalBPrediction]:
        data, count = (
            await db.table(self.model.table_name)
            .select("*")
            .eq("job_id", job_id)
            .execute()
        )
        _, got = data
        return self.model(**got[0]) if got else None


# Instantiate the CRUDConformationalBPrediction object
crud_conformational_b_prediction = CRUDConformationalBPrediction(
    ConformationalBPrediction
)
