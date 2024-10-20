import logging
from typing import ClassVar, List, Optional

from pydantic import BaseModel, Field, model_validator

from app.schemas.base import CreateBase, InDBBase, JobMixin, ResponseBase, UpdateBase

logger = logging.getLogger(__name__)


# Define the structure of the CSV data as a Pydantic model
class PredictionResult(BaseModel):
    PDB_ID: Optional[str] = Field(default=None)
    Chain: Optional[str] = Field(default=None)
    Residue_position: int
    AA: str
    Epitope_score: float
    N_glyco_label: int
    Hydrophilicity: Optional[float] = Field(default=None)
    Charge: Optional[int] = Field(default=None)
    ASA: Optional[float] = Field(default=None)
    RSA: Optional[float] = Field(default=None)
    B_Factor: Optional[float] = Field(default=None)


class ConformationalBPredictionCreate(CreateBase, JobMixin):
    sequence: Optional[str] = Field(None)
    pdb_id: Optional[str] = Field(None, max_length=20)
    chain: Optional[str] = Field(None, max_length=50)
    is_structure_based: bool = Field(default=False)
    bcr_recognition_probability_method: str = Field(..., max_length=50)
    surface_accessibility_method: Optional[str] = Field(None, max_length=50)
    result: List[PredictionResult] = []

    @model_validator(mode="before")
    def check_sequence_or_pdb(cls, values):
        sequence = values.get("sequence")
        pdb_id = values.get("pdb_id")
        if not sequence and not pdb_id:
            logger.error("Validation failed: neither sequence nor pdb_id provided.")
            raise ValueError("You must provide either a sequence or a PDB ID.")
        if sequence and pdb_id:
            logger.error("Validation failed: both sequence and pdb_id provided.")
            raise ValueError("Provide either a sequence or a PDB ID, not both.")
        logger.info(f"Validation passed for values: {values}")
        return values


class ConformationalBPredictionUpdate(UpdateBase):
    result: List[PredictionResult]


class ConformationalBPredictionInDBBase(InDBBase, JobMixin):
    sequence: Optional[str] = None
    pdb_id: Optional[str] = None
    chain: Optional[str] = None
    is_structure_based: bool
    bcr_recognition_probability_method: str
    surface_accessibility_method: Optional[str]
    result: List[PredictionResult]
    csv_download_url: Optional[str]


class ConformationalBPrediction(ResponseBase, JobMixin):
    sequence: Optional[str] = None
    pdb_id: Optional[str] = None
    chain: Optional[str] = None
    is_structure_based: bool
    bcr_recognition_probability_method: str
    surface_accessibility_method: Optional[str]
    result: List[PredictionResult]
    csv_download_url: Optional[str]

    table_name: ClassVar[str] = "epi_conformational_b_prediction"
