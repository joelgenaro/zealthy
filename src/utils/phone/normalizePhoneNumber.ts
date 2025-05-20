const normalizePhoneNumber = (
  input: string | null | undefined,
  defaultCountryCode: string = '+1'
): string | null => {
  if (!input) {
    return null;
  }
  // Remove all non-digit characters except a leading +
  let cleaned = input.replace(/[^\d+]/g, '');

  // If the cleaned number doesn't have a country code, add the default cc to the beginning
  let fullNumber = cleaned.startsWith('+')
    ? cleaned
    : `${defaultCountryCode}${cleaned}`;

  // Validate length (7–15 digits including country code, excluding +)
  const digitLength = fullNumber.length - 1;
  if (digitLength < 7 || digitLength > 15) {
    return null;
  }

  // Ensure it starts with + and contains only digits after
  if (!/^\+\d+$/.test(fullNumber)) {
    return null;
  }

  return fullNumber;
};

export default normalizePhoneNumber;
