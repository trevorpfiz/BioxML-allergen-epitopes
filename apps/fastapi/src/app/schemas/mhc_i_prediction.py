from typing import ClassVar, List, Optional

from pydantic import BaseModel, Field

from app.schemas.base import CreateBase, InDBBase, JobMixin, ResponseBase, UpdateBase


# Define the structure of the CSV data for MHC-I as a Pydantic model
class MhcIPredictionResult(BaseModel):
    Peptide_Sequence: str
    ClassI_TCR_Recognition: Optional[float] = Field(default=None)
    ClassI_MHC_Binding_Affinity: Optional[str] = Field(default="")
    ClassI_pMHC_Stability: Optional[str] = Field(default="")
    Best_Binding_Affinity: Optional[str] = Field(default="")
    Best_pMHC_Stability: Optional[str] = Field(default="")


class MhcIPredictionCreate(CreateBase, JobMixin):
    sequence: str = Field(...)
    alleles: List[str]
    tcr_recognition_probability_method: str = Field(..., max_length=50)
    mhc_binding_affinity_method: str = Field(..., max_length=50)
    pmhc_stability_method: str = Field(..., max_length=50)
    result: List[MhcIPredictionResult] = []


class MhcIPredictionUpdate(UpdateBase):
    result: List[MhcIPredictionResult]


class MhcIPredictionInDBBase(InDBBase, JobMixin):
    sequence: str
    alleles: List[str]
    tcr_recognition_probability_method: str
    mhc_binding_affinity_method: str
    pmhc_stability_method: str
    result: List[MhcIPredictionResult]
    csv_download_url: Optional[str]


class MhcIPrediction(ResponseBase, JobMixin):
    sequence: str
    alleles: List[str]
    tcr_recognition_probability_method: str
    mhc_binding_affinity_method: str
    pmhc_stability_method: str
    result: List[MhcIPredictionResult]
    csv_download_url: Optional[str]

    table_name: ClassVar[str] = "epi_mhc_i_prediction"
