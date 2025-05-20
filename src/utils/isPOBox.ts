export function isPOBox(addressLine: string) {
  // Regular expression to match "PO Box", "P.O. Box", "Post Office Box", or variations
  const poBoxRegex =
    /(?:\bP\s?\.?\s?O\s?\.?\s?Box\b|\bPO\s?\.?\s?Box\b|\bPost\s?Office\s?Box\b)/i;

  return poBoxRegex.test(addressLine);
}
