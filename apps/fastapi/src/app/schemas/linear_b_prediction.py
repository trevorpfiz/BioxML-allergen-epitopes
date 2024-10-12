from typing import ClassVar, List, Optional

from pydantic import BaseModel, Field

from app.schemas.base import CreateBase, InDBBase, JobMixin, ResponseBase, UpdateBase


# Define the structure of the CSV data for Linear B as a Pydantic model
class LBPredictionResult(BaseModel):
    Peptide_Sequence: str
    Linear_B_Cell_Immunogenicity: float
    Linear_BCR_Recognition: float


class LinearBPredictionCreate(CreateBase, JobMixin):
    sequence: str = Field(..., max_length=50)
    b_cell_immunogenicity_method: str = Field(..., max_length=50)
    bcr_recognition_probability_method: str = Field(..., max_length=50)
    result: List[LBPredictionResult] = []


class LinearBPredictionUpdate(UpdateBase):
    result: List[LBPredictionResult]


class LinearBPredictionInDBBase(InDBBase, JobMixin):
    sequence: str
    b_cell_immunogenicity_method: str
    bcr_recognition_probability_method: str
    result: List[LBPredictionResult]
    csv_download_url: Optional[str]


class LinearBPrediction(ResponseBase, JobMixin):
    sequence: str
    b_cell_immunogenicity_method: str
    bcr_recognition_probability_method: str
    result: List[LBPredictionResult]
    csv_download_url: Optional[str]

    table_name: ClassVar[str] = "epi_linear_b_prediction"
