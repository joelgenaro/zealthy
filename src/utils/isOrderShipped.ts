import { OrderPrescriptionProps } from '@/components/hooks/data';
import isAfter from 'date-fns/isAfter';

export const plus10days = (date: string) => {
  const current = new Date(date);
  return new Date(current.setDate(current.getDate() + 10));
};

export const isOrderShipped = (order: OrderPrescriptionProps) => {
  if (
    ['Hallandale', 'Red Rock'].includes(order?.prescription?.pharmacy || '')
  ) {
    return isAfter(Date.now(), plus10days(order?.created_at!));
  }

  return !!order?.tracking_number;
};
