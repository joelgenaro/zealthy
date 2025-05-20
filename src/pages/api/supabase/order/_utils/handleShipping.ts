import { handleInTransitOrder } from './handleInTransitOrder';
import { handleDeliveredOrder } from './handleDeliveredOrder';
import { Order, NonNullableOrder } from './types';

export const handleShipping = async (order: Order) => {
  try {
    if (!order.patient_id || !order.prescription_id) {
      throw new Error(
        `Order ${order.id} does not have patient id or prescription id associated with it`
      );
    }

    // handle in_transit status
    if (
      order?.shipment_details === 'in_transit' ||
      order?.order_status === 'IN_TRANSIT'
    ) {
      await handleInTransitOrder(order as NonNullableOrder);
    }

    // handle delivered status
    if (
      order?.shipment_details === 'delivered' ||
      order?.order_status === 'DELIVERED'
    ) {
      await handleDeliveredOrder(order as NonNullableOrder);
    }

    return;
  } catch (err) {
    throw err;
  }
};
