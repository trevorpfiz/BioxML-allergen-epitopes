import logging
from typing import Any, Dict, List

from mhcnames import normalize_allele_name

# Import the correct elution score versions of the predictors
from mhctools import NetMHCIIpan43_BA, NetMHCpan41

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

    # Validate and normalize alleles
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
        predictor = NetMHCpan41(alleles=alleles)
    elif predictor_type == "netmhciipan":
        predictor = NetMHCIIpan43_BA(alleles=alleles)

    if not predictor:
        raise ValueError(f"Unknown predictor type: {predictor_type}")

    # Iterate over the grouped peptides by length and run predictions
    for length, peptides_subset in peptides_by_length.items():
        try:
            logger.info(
                f"Predicting subsequences for peptides: {peptides_subset} and length: {length}"
            )

            # Run prediction for all peptides of this length and all alleles at once
            binding_predictions = predictor.predict_subsequences(
                {f"seq{i}": seq for i, seq in enumerate(peptides_subset)},
                peptide_lengths=[length],
            )

            if not binding_predictions:
                logger.error(f"No predictions for length {length}")
                continue

            # Convert predictions to a DataFrame and then to a dictionary
            df = binding_predictions.to_dataframe()
            logger.info(f"Prediction DataFrame: {df}")
            logger.info(f"Converted to dict: {df.to_dict(orient='records')}")
            results.append(
                {
                    "length": length,
                    "peptides": peptides_subset,
                    "result": df.to_dict(orient="records"),
                }
            )
            logger.info(f"Successfully predicted binding affinity for length {length}.")
        except Exception as e:
            logger.error(f"Error processing length {length}: {e}")
            results.append(
                {
                    "length": length,
                    "peptides": peptides_subset,
                    "error": str(e),
                }
            )

    return results
