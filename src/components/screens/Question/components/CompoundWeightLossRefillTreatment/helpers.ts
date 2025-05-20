import { CompoundDetailProps } from './CompoundWeightLossRefillTreatment';

interface SavingsPerMgResult {
  threeMonth: number;
  sixMonth: number;
  twelveMonth: number;
}

/**
 * Calculates savings per mg for different subscription periods
 * @param med - Selected medication
 * @param compoundDetails - Compound medication details including prices and dosages
 * @returns Object containing savings per mg for 3, 6, and 12 month periods
 */
export const calculateSavingsPerMg = (
  med: string,
  compoundDetails: CompoundDetailProps
): SavingsPerMgResult => {
  const details = compoundDetails[med];
  const result: SavingsPerMgResult = {
    threeMonth: 0,
    sixMonth: 0,
    twelveMonth: 0,
  };

  // Return early if basic medication data is missing
  if (!details?.medData?.price || !details?.medData?.dosage) {
    return result;
  }

  // Extract single month dosage (e.g. "2.5mg")
  const singleMatch = details.medData.dosage.match(/(\d+(?:\.\d+)?)\s*mg/);
  if (!singleMatch) {
    return result;
  }
  const singleMg = parseFloat(singleMatch[1]);

  // Base monthly membership price used in all calculations
  const baseMonthlyMembership = 135;

  // Calculate 3 month savings
  if (details.medBulkData?.price && details.medBulkData?.dosage) {
    // Extract bulk dosage amount
    const bulkMatch = details.medBulkData.dosage.match(/(\d+(?:\.\d+)?)\s*mg/);
    if (bulkMatch) {
      const bulkMg = parseFloat(bulkMatch[1]);

      // Calculate ratio to normalize prices (accounts for different dosage amounts)
      const monthsRatio = bulkMg / singleMg;

      // Calculate normalized price per mg for single month supply over 3 months
      const singlePricePerMg =
        (details.medData.price * 3) / (singleMg * monthsRatio);

      // Calculate price per mg for bulk (3 month) supply
      const bulkPricePerMg = details.medBulkData.price / bulkMg;

      // Calculate medication savings (difference between normalized single month and bulk prices)
      const medicationSavings =
        singlePricePerMg * bulkMg - bulkPricePerMg * bulkMg;

      // Calculate membership savings (20% off 3 months of membership)
      const membershipSavings = baseMonthlyMembership * 3 * 0.2;

      // Calculate total savings and savings per mg
      const totalSavings = medicationSavings + membershipSavings;
      const savingsPerMg = totalSavings / bulkMg;
      result.threeMonth =
        savingsPerMg > 0 ? Number(savingsPerMg.toFixed(2)) : 0;
    }
  }

  // Calculate 6 month savings
  if (details.medSixMonthData?.price && details.medSixMonthData?.dosage) {
    // Extract two dosage amounts from the 6 month supply
    const sixMonthMatch = details.medSixMonthData.dosage.match(
      /(\d+(?:\.\d+)?)\s*mg.*?(\d+(?:\.\d+)?)\s*mg/
    );
    if (sixMonthMatch) {
      // Sum both doses to get total mg
      const sixMonthTotalMg =
        parseFloat(sixMonthMatch[1]) + parseFloat(sixMonthMatch[2]);

      // Calculate ratio to normalize prices
      const monthsRatio = sixMonthTotalMg / singleMg;

      // Calculate normalized price per mg for single month supply over 6 months
      const singlePricePerMg =
        (details.medData.price * 6) / (singleMg * monthsRatio);

      // Calculate price per mg for 6 month supply
      const sixMonthPricePerMg =
        details.medSixMonthData.price / sixMonthTotalMg;

      // Calculate medication savings
      const medicationSavings =
        singlePricePerMg * sixMonthTotalMg -
        sixMonthPricePerMg * sixMonthTotalMg;

      // Calculate membership savings (22% off 5 months of membership)
      const membershipSavings = baseMonthlyMembership * 5 * 0.22;

      // Calculate total savings and savings per mg
      const totalSavings = medicationSavings + membershipSavings;
      const savingsPerMg = totalSavings / sixMonthTotalMg;
      result.sixMonth = savingsPerMg > 0 ? Number(savingsPerMg.toFixed(2)) : 0;
    }
  }

  // Calculate 12 month savings
  if (details.medTwelveMonthData?.price && details.medTwelveMonthData?.dosage) {
    // Extract four dosage amounts from the 12 month supply
    const twelveMonthMatch = details.medTwelveMonthData.dosage.match(
      /(\d+(?:\.\d+)?)\s*mg.*?(\d+(?:\.\d+)?)\s*mg.*?(\d+(?:\.\d+)?)\s*mg.*?(\d+(?:\.\d+)?)\s*mg/
    );
    if (twelveMonthMatch) {
      // Sum all four doses to get total mg
      const twelveMonthTotalMg =
        parseFloat(twelveMonthMatch[1]) +
        parseFloat(twelveMonthMatch[2]) +
        parseFloat(twelveMonthMatch[3]) +
        parseFloat(twelveMonthMatch[4]);

      // Calculate ratio to normalize prices
      const monthsRatio = twelveMonthTotalMg / singleMg;

      // Calculate normalized price per mg for single month supply over 12 months
      const singlePricePerMg =
        (details.medData.price * 12) / (singleMg * monthsRatio);

      // Calculate price per mg for 12 month supply
      const twelveMonthPricePerMg =
        details.medTwelveMonthData.price / twelveMonthTotalMg;

      // Calculate medication savings
      const medicationSavings =
        singlePricePerMg * twelveMonthTotalMg -
        twelveMonthPricePerMg * twelveMonthTotalMg;

      // Calculate membership savings (27% off 11 months of membership)
      const membershipSavings = baseMonthlyMembership * 11 * 0.27;

      // Calculate total savings and savings per mg
      const totalSavings = medicationSavings + membershipSavings;
      const savingsPerMg = totalSavings / twelveMonthTotalMg;
      result.twelveMonth =
        savingsPerMg > 0 ? Number(savingsPerMg.toFixed(2)) : 0;
    }
  }

  return result;
};
