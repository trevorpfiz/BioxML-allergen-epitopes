from datetime import datetime, timezone

from fastapi import HTTPException
from supabase._async.client import AsyncClient

from app.crud.base import CRUDBase
from app.schemas.auth import UserIn
from app.schemas.job import Job, JobCreate, JobUpdate


class CRUDJob(CRUDBase[Job, JobCreate, JobUpdate]):
    async def create(self, db: AsyncClient, *, obj_in: JobCreate, user: UserIn) -> Job:
        """Create a new job linked to the current user"""
        data = obj_in.model_dump()
        data["profile_id"] = user.id
        data["updated_at"] = datetime.now(tz=timezone.utc).isoformat()

        response = await db.table(self.model.table_name).insert(data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create job")

        created_job = response.data[0]
        return Job(**created_job)

    async def update(
        self, db: AsyncClient, *, obj_in: JobUpdate, id: str, user: UserIn
    ) -> Job:
        """Update an existing job linked to the current user"""
        data = obj_in.model_dump()
        data["updated_at"] = datetime.now(tz=timezone.utc).isoformat()

        response = (
            await db.table(self.model.table_name)
            .update(data)
            .eq("id", id)
            .eq("profile_id", user.id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Job not found")

        updated_job = response.data[0]
        return Job(**updated_job)

    async def update_status(self, db: AsyncClient, id: str, status: str) -> Job:
        """Update the status of a job"""
        response = (
            await db.table(self.model.table_name)
            .update(
                {
                    "status": status,
                    "updated_at": datetime.now(tz=timezone.utc).isoformat(),
                }
            )
            .eq("id", id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Job not found")
        return Job(**response.data[0])


# Instantiate the CRUDJob object
crud_job = CRUDJob(Job)
