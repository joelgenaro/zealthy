import { sendOrderDeliveredNotification } from './sendOrderDeliveredNotification';
import { NonNullableOrder } from './types';
import { updateNextRefillCreatedAtDate } from './updateNextRefillCreatedAtDate';
import { updateActionItem } from './updateActionItem';

export const handleDeliveredOrder = async (order: NonNullableOrder) => {
  try {
    await Promise.allSettled([
      updateNextRefillCreatedAtDate(order),
      updateActionItem(order),
      sendOrderDeliveredNotification(order),
    ]);

    return;
  } catch (err) {
    throw err;
  }
};
