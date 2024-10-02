from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel, Field

from app.schemas.base import ResponseBase


# Properties to receive on item creation
class ReportCreate(BaseModel):
    title: str = Field(..., max_length=256)
    content: str


# Properties to receive on item update
class ReportUpdate(BaseModel):
    title: str | None = Field(None, max_length=256)
    content: str | None = None


# Properties shared by models stored in DB
class ReportInDBBase(BaseModel):
    id: str
    title: str
    content: str
    profile_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Properties to return to client via API
class Report(ResponseBase):
    id: str
    title: str
    content: str
    profile_id: str
    created_at: datetime
    updated_at: datetime

    table_name: ClassVar[str] = "epi_report"

    class Config:
        orm_mode = True


# Types for Reports
class ReportResponse(BaseModel):
    id: str
    title: str
    content: str
    profile_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
