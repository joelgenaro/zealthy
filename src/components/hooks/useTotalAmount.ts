import { calculateTotal } from '@/utils/calculateTotal';
import { Order } from '../screens/Checkout/types';

export const useTotalAmount = (order: Order) => {
  let total = 0;

  if (order.subscriptions.length) {
    total += calculateTotal(
      order.subscriptions.filter(s => s.require_payment_now)
    );
  }

  if (order.medications.length) {
    total += calculateTotal(
      order.medications.filter(m => m.require_payment_now)
    );
  }

  if (order.coaching.length) {
    total += calculateTotal(order.coaching.filter(c => c.require_payment_now));
  }

  if (order.visit) {
    total += calculateTotal([order.visit].filter(v => v.require_payment_now));
  }

  if (order.consultation.length) {
    total += calculateTotal(
      order.consultation.filter(v => v.require_payment_now)
    );
  }

  return total;
};
