from datetime import datetime, timezone

from fastapi import HTTPException
from supabase._async.client import AsyncClient

from app.crud.base import CRUDBase
from app.schemas.auth import UserIn
from app.schemas.report import Report, ReportCreate, ReportUpdate


class CRUDReport(CRUDBase[Report, ReportCreate, ReportUpdate]):
    async def create(
        self, db: AsyncClient, *, obj_in: ReportCreate, user: UserIn
    ) -> Report:
        data = obj_in.model_dump()
        data["profile_id"] = user.id
        data["updated_at"] = datetime.now(tz=timezone.utc).isoformat()

        response = await db.table(self.model.table_name).insert(data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create report")

        created_report = response.data[0]
        return Report(**created_report)

    # Update an existing report and set updated_at manually
    async def update(
        self, db: AsyncClient, *, obj_in: ReportUpdate, id: str, user: UserIn
    ) -> Report:
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
            raise HTTPException(status_code=404, detail="Report not found")

        updated_report = response.data[0]
        return Report(**updated_report)

    # Optionally, override other methods if needed
    # For example, to add more logic during update or delete


# Instantiate the CRUDReport object
crud_report = CRUDReport(Report)
