import logging
from typing import Any, Dict, List

from mhcnames import normalize_allele_name

# Import the correct elution score versions of the predictors
from mhctools import NetMHCIIpan43, NetMHCpan41

logger = logging.getLogger(__name__)


async def run_binding_predictions(
    peptides: List[str], alleles: List[str], predictor_type: str
) -> List[Dict[str, Any]]:
    """
    Helper function to group peptides by length and run predictions.

    Args:
        peptides (List[str]): List of peptides.
        alleles (List[str]): List of alleles.
        predictor_type (str): Either 'netmhcpan' or 'netmhciipan'.

    Returns:
        List[Dict[str, Any]]: List of prediction results for each allele and peptide length.
    """

    # Validate alleles
    try:
        alleles = [normalize_allele_name(a) for a in alleles]
        logger.info(f"Normalized alleles: {alleles}")
    except Exception as e:
        logger.error(f"Error normalizing alleles: {e}")
        return {"error": str(e)}

    results = []
    peptides_by_length = {}

    # Group peptides by their length
    for peptide in peptides:
        length = len(peptide)

        # Ensure that the length is valid
        if length is None or not isinstance(length, int):
            logger.error(f"Invalid peptide length for peptide: {peptide}")
            continue

        peptides_by_length.setdefault(length, []).append(peptide)

    # Initialize predictor based on the type
    predictor = None
    if predictor_type == "netmhcpan":
        # Use NetMHCpan41_EL for elution score mode
        predictor = NetMHCpan41(alleles=alleles)
    elif predictor_type == "netmhciipan":
        # Use NetMHCIIpan43_EL for elution score mode
        predictor = NetMHCIIpan43(alleles=alleles)

    if not predictor:
        raise ValueError(f"Unknown predictor type: {predictor_type}")

    for allele in alleles:
        for length, peptides_subset in peptides_by_length.items():
            try:
                # Ensure valid peptide length before processing
                if length is None or not isinstance(length, int):
                    logger.error(
                        f"Skipping invalid length for peptides: {peptides_subset}"
                    )
                    continue

                logger.info(
                    f"Predicting subsequences for peptides: {peptides_subset} and length: {length}"
                )

                binding_predictions = predictor.predict_subsequences(
                    {f"seq{i}": seq for i, seq in enumerate(peptides_subset)},
                    peptide_lengths=[length],
                )

                if not binding_predictions:
                    logger.error(
                        f"No predictions for allele {allele} and length {length}"
                    )
                    continue

                # Convert predictions to a DataFrame and then to a dictionary
                df = binding_predictions.to_dataframe()
                logger.info(f"Prediction DataFrame: {df}")
                logger.info(f"Converted to dict: {df.to_dict(orient='records')}")
                results.append(
                    {
                        "allele": allele,
                        "length": length,
                        "peptides": peptides_subset,
                        "result": df.to_dict(orient="records"),
                    }
                )
                logger.info(
                    f"Successfully predicted binding affinity for allele {allele} and length {length}."
                )
            except Exception as e:
                logger.error(
                    f"Error processing allele {allele} and length {length}: {e}"
                )
                results.append(
                    {
                        "allele": allele,
                        "length": length,
                        "peptides": peptides_subset,
                        "error": str(e),
                    }
                )

    return results
