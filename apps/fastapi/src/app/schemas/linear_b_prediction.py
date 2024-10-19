from typing import ClassVar, List, Optional

from pydantic import BaseModel, Field

from app.schemas.base import CreateBase, InDBBase, JobMixin, ResponseBase, UpdateBase


# Define the structure of the CSV data for Linear B as a Pydantic model
class LBPredictionResult(BaseModel):
    Peptide_Sequence: str
    Linear_B_Cell_Immunogenicity: Optional[float] = Field(default=None)
    Linear_BCR_Recognition: Optional[float] = Field(default=None)


class LinearBPredictionCreate(CreateBase, JobMixin):
    sequence: str = Field(...)
    b_cell_immunogenicity_method: Optional[str] = Field(None, max_length=50)
    bcr_recognition_probability_method: str = Field(..., max_length=50)
    result: List[LBPredictionResult] = []


class LinearBPredictionUpdate(UpdateBase):
    result: List[LBPredictionResult]


class LinearBPredictionInDBBase(InDBBase, JobMixin):
    sequence: str
    b_cell_immunogenicity_method: Optional[str]
    bcr_recognition_probability_method: str
    result: List[LBPredictionResult]
    csv_download_url: Optional[str]


class LinearBPrediction(ResponseBase, JobMixin):
    sequence: str
    b_cell_immunogenicity_method: Optional[str]
    bcr_recognition_probability_method: str
    result: List[LBPredictionResult]
    csv_download_url: Optional[str]

    table_name: ClassVar[str] = "epi_linear_b_prediction"
