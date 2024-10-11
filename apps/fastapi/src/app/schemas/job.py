from enum import Enum
from typing import ClassVar, List, Optional

from pydantic import Field

from app.schemas.base import (
    CreateBase,
    InDBBase,
    ProfileMixin,
    ResponseBase,
    UpdateBase,
)
from app.schemas.conformational_b_prediction import ConformationalBPrediction


class JobType(str, Enum):
    linear_b = "linear-b"
    conformational_b = "conformational-b"
    mhc_i = "mhc-i"
    mhc_ii = "mhc-ii"


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class JobCreate(CreateBase):
    name: str = Field(..., max_length=256)
    type: JobType


class JobUpdate(UpdateBase):
    name: Optional[str] = Field(None, max_length=256)
    type: Optional[JobType] = None
    share_token: Optional[str] = None


class JobInDBBase(InDBBase, ProfileMixin):
    name: str
    type: JobType
    status: JobStatus
    share_token: Optional[str]


class Job(ResponseBase, ProfileMixin):
    name: str
    type: JobType
    status: JobStatus
    share_token: Optional[str]

    conformational_b_predictions: List[ConformationalBPrediction] = []
    # linear_b_predictions: List[LinearBPrediction] = []
    # mhc_i_predictions: List[MhcIPrediction] = []
    # mhc_ii_predictions: List[MhcIIPrediction] = []

    table_name: ClassVar[str] = "epi_job"
