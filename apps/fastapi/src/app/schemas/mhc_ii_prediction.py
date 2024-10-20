from typing import ClassVar, List, Optional

from pydantic import BaseModel, Field

from app.schemas.base import CreateBase, InDBBase, JobMixin, ResponseBase, UpdateBase


# Define the structure of the CSV data for MHC-II as a Pydantic model
class MhcIIPredictionResult(BaseModel):
    Peptide_Sequence: str
    ClassII_TCR_Recognition: Optional[float] = Field(default=None)
    ClassII_MHC_Binding_Affinity: Optional[str] = Field(default="")
    ClassII_pMHC_Stability: Optional[str] = Field(default="")
    Best_Binding_Affinity: Optional[str] = Field(default="")
    Best_pMHC_Stability: Optional[str] = Field(default="")


class MhcIIPredictionCreate(CreateBase, JobMixin):
    sequence: str = Field(...)
    alleles: List[str]
    tcr_recognition_probability_method: str = Field(..., max_length=50)
    mhc_binding_affinity_method: str = Field(..., max_length=50)
    pmhc_stability_method: str = Field(..., max_length=50)
    result: List[MhcIIPredictionResult] = []


class MhcIIPredictionUpdate(UpdateBase):
    result: List[MhcIIPredictionResult]


class MhcIIPredictionInDBBase(InDBBase, JobMixin):
    sequence: str
    alleles: List[str]
    tcr_recognition_probability_method: str
    mhc_binding_affinity_method: str
    pmhc_stability_method: str
    result: List[MhcIIPredictionResult]
    csv_download_url: Optional[str]


class MhcIIPrediction(ResponseBase, JobMixin):
    sequence: str
    alleles: List[str]
    tcr_recognition_probability_method: str
    mhc_binding_affinity_method: str
    pmhc_stability_method: str
    result: List[MhcIIPredictionResult]
    csv_download_url: Optional[str]

    table_name: ClassVar[str] = "epi_mhc_ii_prediction"
