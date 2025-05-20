import {
  paymentSuccessPrescriptionProcessedGLP1,
  paymentSuccessPrescriptionProcessedGLP16Months,
  paymentSuccessPrescriptionProcessedGLP112Months,
} from './freshpaint/events';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Determines which payment success event to fire based on the duration in days
 * - 30-90 days: standard GLP1 event
 * - 180 days (6 months): 6-month specific GLP1 event
 * - 360+ days (12 months): 12-month specific GLP1 event
 */
export function getGLP1EventByDuration(durationInDays?: number) {
  if (!durationInDays) return 'standard';

  if (durationInDays <= 90) return 'standard';
  if (durationInDays === 180) return 'six_month';
  return 'twelve_month';
}

/**
 * Gets the true duration in days from the compound_matrix table if available
 * @param prescription The prescription object containing matrix_id
 * @returns The true duration in days or null if not found
 */
export async function getTrueDurationInDays(prescription: any) {
  if (!prescription?.matrix_id) {
    return prescription?.duration_in_days || null;
  }

  const { data: matrixData } = await supabaseAdmin
    .from('compound_matrix')
    .select('duration_in_days')
    .eq('id', prescription.matrix_id)
    .single();

  return matrixData?.duration_in_days || prescription?.duration_in_days || null;
}

/**
 * Fires the appropriate GLP1 payment success event based on the duration in days
 */
export async function fireGLP1PaymentSuccessEvent(
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  paymentSucceededAt: string,
  total: string | number,
  cardBrand: string | null | undefined,
  last4: string | null | undefined,
  durationInDays: number | null | undefined,
  pharmacy: string | null | undefined,
  prescription: any = null,
  has216?: boolean | null
) {
  let actualDurationInDays = durationInDays;

  if (prescription?.matrix_id) {
    const trueDuration = await getTrueDurationInDays(prescription);
    if (trueDuration) {
      actualDurationInDays = trueDuration;
      console.log(
        `Using true duration from matrix: ${actualDurationInDays} days`
      );
    }
  }

  const eventType = getGLP1EventByDuration(actualDurationInDays || undefined);

  console.log(
    `Firing GLP1 event: ${eventType} for duration: ${actualDurationInDays} days`
  );

  switch (eventType) {
    case 'six_month':
      return paymentSuccessPrescriptionProcessedGLP16Months(
        id,
        email,
        orderId,
        paymentSucceededAt,
        total,
        cardBrand,
        last4,
        actualDurationInDays,
        pharmacy
      );
    case 'twelve_month':
      return paymentSuccessPrescriptionProcessedGLP112Months(
        id,
        email,
        orderId,
        paymentSucceededAt,
        total,
        cardBrand,
        last4,
        actualDurationInDays,
        pharmacy
      );
    default:
      return paymentSuccessPrescriptionProcessedGLP1(
        id,
        email,
        orderId,
        paymentSucceededAt,
        total,
        cardBrand,
        last4,
        actualDurationInDays,
        pharmacy,
        has216
      );
  }
}
