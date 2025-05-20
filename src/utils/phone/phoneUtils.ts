import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

interface PhoneNumberError extends Error {
  message: string;
}

// This function validates by country code allowing us to enforce correction of wrong inputs for clients
export function isValidPhoneNumber(
  phoneNumber: string,
  countryCode: string = 'US'
): boolean {
  try {
    const cleanedNumber = phoneNumber.trim();
    const number = phoneUtil.parseAndKeepRawInput(cleanedNumber, countryCode);
    return (
      phoneUtil.isValidNumber(number) && phoneUtil.isPossibleNumber(number)
    );
  } catch (error) {
    return false;
  }
}

export function getAllCountryCodes(): {
  regionCode: string;
  callingCode: number;
}[] {
  const supportedRegions = phoneUtil.getSupportedRegions();
  return supportedRegions.map(regionCode => ({
    regionCode,
    callingCode: phoneUtil.getCountryCodeForRegion(regionCode),
  }));
}

export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: string
): string {
  try {
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, countryCode);
    return phoneUtil.formatInOriginalFormat(number, countryCode);
  } catch (error) {
    return phoneNumber; // Return unformatted if parsing fails
  }
}

export function formatToE164(
  phoneNumber: string,
  countryCode: string
): string | null {
  try {
    const parsedNumber = phoneUtil.parse(phoneNumber, countryCode);
    return phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);
  } catch (error) {
    const typedError = error as PhoneNumberError;
    console.error('Invalid phone number:', typedError.message);
    return null; // Handle errors as needed
  }
}

// This function validates by E164 format, allowing us to confirm before database entry.
export function isValidE164Number(phoneNumber: string | null): boolean {
  try {
    if (phoneNumber === null) {
      return false;
    }
    // Parse the number without a region (E.164 includes country code)
    const parsedNumber = phoneUtil.parse(phoneNumber);

    // Check if the parsed number is valid
    return phoneUtil.isValidNumber(parsedNumber);
  } catch (error) {
    const typedError = error as PhoneNumberError;
    console.error('Invalid phone number:', typedError.message);
    return false;
  }
}
