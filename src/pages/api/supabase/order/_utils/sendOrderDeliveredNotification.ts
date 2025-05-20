import {
  prescriptionDelivered,
  prescriptionEnded,
  prescriptionWeightLossCompoundEnded,
} from '@/utils/freshpaint/events';
import {
  findAddress,
  findEmail,
  findPrescription,
  findProfileId,
} from './helpers';
import { NonNullableOrder } from './types';

export const sendOrderDeliveredNotification = async (
  order: NonNullableOrder
) => {
  try {
    //send notification
    const [email, profileId, prescription, address] = await Promise.all([
      findEmail(order.patient_id),
      findProfileId(order.patient_id),
      findPrescription(order.prescription_id),
      findAddress(order.patient_id),
    ]);

    if (email && prescription && address) {
      await prescriptionDelivered(
        profileId,
        email,
        order?.id,
        prescription?.medication,
        order?.tracking_number,
        address?.address_line_1,
        address?.address_line_2,
        address?.city,
        address?.state,
        address?.zip_code
      );

      if (order.gogo_order_id && order.out_of_refill) {
        prescriptionEnded(
          profileId,
          email,
          prescription?.medication,
          prescription?.duration_in_days
        );
        return;
      }

      if (
        order.tmc_order_id ||
        order.empower_order_id ||
        order.hallandale_order_id
      ) {
        prescriptionWeightLossCompoundEnded(
          profileId,
          email,
          prescription?.medication,
          prescription?.duration_in_days
        );
        return;
      }
    }
  } catch (err) {
    throw err;
  }
};
