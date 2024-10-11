from typing import ClassVar, List, Optional

from pydantic import BaseModel, Field

from app.schemas.base import CreateBase, InDBBase, JobMixin, ResponseBase, UpdateBase


# Define the structure of the CSV data as a Pydantic model
class PredictionResult(BaseModel):
    PDB_ID: str
    Chain: str
    Residue_position: int
    AA: str
    Epitope_score: float
    N_glyco_label: int


class ConformationalBPredictionCreate(CreateBase, JobMixin):
    pdb_id: str = Field(..., max_length=10)
    chain: str = Field(..., max_length=10)
    bcr_recognition_probability_method: str = Field(..., max_length=50)
    surface_accessibility_method: str = Field(..., max_length=50)
    result: List[PredictionResult] = []


class ConformationalBPredictionUpdate(UpdateBase):
    result: List[PredictionResult]


class ConformationalBPredictionInDBBase(InDBBase, JobMixin):
    pdb_id: str
    chain: str
    bcr_recognition_probability_method: str
    surface_accessibility_method: str
    result: List[PredictionResult]
    csv_download_url: Optional[str]


class ConformationalBPrediction(ResponseBase, JobMixin):
    pdb_id: str
    chain: str
    bcr_recognition_probability_method: str
    surface_accessibility_method: str
    result: List[PredictionResult]
    csv_download_url: Optional[str]
    job_id: str

    table_name: ClassVar[str] = "epi_conformational_b_prediction"
