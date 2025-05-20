import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NonNullableField } from '@/types/utils/required';
import { prescriptionShipped } from '@/utils/freshpaint/events';
import { format } from 'date-fns';
import {
  findAddress,
  findEmail,
  findPrescription,
  findProfileId,
} from './helpers';

type Order = NonNullableField<
  Database['public']['Tables']['order']['Row'],
  'patient_id' | 'prescription_id'
>;

export const handleInTransitOrder = async (order: Order) => {
  try {
    console.log(`Updating order ${order.id} to in-transit status`);
    await supabaseAdmin
      .from('order')
      .update({
        date_shipped: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
      })
      .eq('id', order.id);

    const [email, profileId, prescription, address] = await Promise.all([
      findEmail(order.patient_id),
      findProfileId(order.patient_id),
      findPrescription(order.prescription_id),
      findAddress(order.patient_id),
    ]);

    // Identify the user before sending events if in a browser environment.
    if (
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
      window.freshpaint &&
      profileId &&
      email
    ) {
      window.freshpaint?.identify(profileId, { email });
    }

    if (email && prescription && address) {
      console.log(
        `All necessary data found for order ${order.id}, firing prescriptionShipped event`
      );
      await prescriptionShipped(
        profileId,
        email,
        order?.id,
        prescription?.medication,
        order?.tracking_number,
        order?.tracking_URL,
        address?.address_line_1,
        address?.address_line_2,
        address?.city,
        address?.state,
        address?.zip_code
      );
    } else {
      console.warn(
        `Missing data for order ${order.id}: email=${email}, profileId=${profileId}, prescription=${prescription}, address=${address}`
      );
    }
    return;
  } catch (err) {
    console.error(`Error handling in-transit order ${order.id}:`, err);
    throw err;
  }
};
