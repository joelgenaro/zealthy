import { isValidE164Number } from '@/utils/phone/phoneUtils';

/**
 * Validates a phone number
 * @param phoneNumber - The phone number to validate
 * @returns Whether the phone number is valid
 */
export function validatePhoneNumber(phoneNumber: string | null): boolean {
  try {
    return isValidE164Number(phoneNumber);
  } catch (error) {
    return false;
  }
}
