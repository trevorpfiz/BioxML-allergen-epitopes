import logging
from typing import Any, Dict, Optional

from fastapi import HTTPException

from app.core.utils import get_default_peptide_lengths, split_protein_sequence

logger = logging.getLogger(__name__)

"""
Preprocessing functions

"""


def extract_sequence(pdb_data: dict) -> str:
    """
    Extracts the amino acid sequence from the PDB data.

    Args:
        pdb_data (dict): JSON response from the RCSB API.

    Returns:
        str: Amino acid sequence.

    Raises:
        HTTPException: If the sequence data is missing.
    """
    try:
        if "rcsb_polymer_entity_instance" in pdb_data:
            sequence = pdb_data["rcsb_polymer_entity_instance"]["entity"][
                "rcsb_polymer_entity"
            ]["rcsb_polymer"]["sequence"]
        else:
            # Handle case when chain is not provided
            sequence = ""
            entities = pdb_data.get("rcsb_entry_container_identifiers", {}).get(
                "polymer_entity_ids", []
            )
            for entity_id in entities:
                entity = pdb_data["polymer_entities"][entity_id]
                sequence += entity["rcsb_polymer"]["sequence"]
        if not sequence:
            raise KeyError
        return sequence
    except KeyError:
        logger.error("Amino acid sequence not found in the PDB data.")
        raise HTTPException(
            status_code=400, detail="Amino acid sequence not found in the PDB data."
        )


def extract_structure(pdb_data: dict) -> Optional[Dict[str, Any]]:
    """
    Extracts structural information from the PDB data.

    Args:
        pdb_data (dict): JSON response from the RCSB API.

    Returns:
        Optional[Dict[str, Any]]: Structural coordinates and other relevant data or None if not available.

    Raises:
        HTTPException: If structural data is missing when required.
    """
    try:
        if "rcsb_polymer_entity_instance" in pdb_data:
            atoms = pdb_data["rcsb_polymer_entity_instance"]["entity"][
                "rcsb_polymer_entity"
            ]["rcsb_polymer"]["atom_sites"]
            return {"atoms": atoms}
        else:
            # Structure data might not be needed if chain is not provided
            return None
    except KeyError:
        logger.error("Structural data not found in the PDB data.")
        if "rcsb_polymer_entity_instance" in pdb_data:
            raise HTTPException(
                status_code=400, detail="Structural data not found in the PDB data."
            )
        return None


def prepare_payload(
    sequence: str, structure: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Prepares the payload for prediction based on available data.

    Args:
        sequence (str): Amino acid sequence.
        structure (Optional[Dict[str, Any]]): Structural data.

    Returns:
        Dict[str, Any]: Payload for prediction.
    """
    payload = {
        "sequence": sequence,
    }
    if structure:
        payload["structure"] = structure
    return payload


def validate_pdb_data(pdb_data: dict, chain: Optional[str] = None) -> Dict[str, Any]:
    """
    Validates and extracts necessary data from PDB response.

    Args:
        pdb_data (dict): JSON response from the RCSB API.
        chain (Optional[str]): Chain ID if provided.

    Returns:
        Dict[str, Any]: Extracted data including sequence and structure.
    """
    sequence = extract_sequence(pdb_data)
    structure = extract_structure(pdb_data) if chain else None
    return {"sequence": sequence, "structure": structure}


def preprocess_protein_sequence(protein_sequence: str, prediction_type: str):
    """
    Preprocess the protein sequence based on prediction type by splitting into peptides.
    """
    min_length, max_length = get_default_peptide_lengths(prediction_type)
    peptides = split_protein_sequence(protein_sequence, min_length, max_length)
    return peptides
