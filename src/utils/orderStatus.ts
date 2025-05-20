import { OrderProps } from '@/components/screens/Prescriptions/OrderHistoryContent';
import { OrderStatus } from '@/types/orderStatus';

export const orderStatusMap: { [key: string]: OrderStatus } = {
  Received: OrderStatus.PROCESSING,
  PENDING: OrderStatus.PROCESSING,
  PAYMENT_SUCCESS: OrderStatus.PROCESSING,
  SENT_TO_GOGOMEDS: OrderStatus.PROCESSING,
  SENT_TO_LOCAL_PHARMACY: OrderStatus.SENT_TO_LOCAL_PHARMACY,
  SENT_TO_RED_ROCK: OrderStatus.PROCESSING,
  SENT_TO_TAILOR_MADE: OrderStatus.PROCESSING,
  SENT_TO_HALLANDALE: OrderStatus.SENT_TO_HALLANDALE,
  BUNDLED_REFILL_2: OrderStatus.BUNDLED_REFILL_2,
  BUNDLED_REFILL_3: OrderStatus.BUNDLED_REFILL_3,
  ORDER_PENDING_ACTION: OrderStatus.ORDER_PENDING_ACTION,
  ORDER_PENDING_REACTIVATION: OrderStatus.ORDER_PENDING_ACTION,
  'Order Received': OrderStatus.PROCESSING,
  'Invoice Created': OrderStatus.PROCESSING,
  'In Dispensary': OrderStatus.PROCESSING,
  'In Shipping': OrderStatus.IN_SHIPPING,
  'Has Shipped': OrderStatus.SHIPPED,
  'Order Canceled': OrderStatus.CANCELED,
  'Picked Up': OrderStatus.SHIPPED,
  'Shipment in progress': OrderStatus.SHIPPED,
  Canceled: OrderStatus.CANCELED,
  CANCELED: OrderStatus.CANCELED,
  CANCELLED: OrderStatus.CANCELED,
  PAYMENT_FAILED: OrderStatus.PAYMENT_FAILED,
  DELIVERED: OrderStatus.DELIVERED,
  Delivered: OrderStatus.DELIVERED,
  SHIPPED: OrderStatus.SHIPPED,
  Complete: OrderStatus.PROCESSING,
  Processing: OrderStatus.PROCESSING,
  TEST_ORDER: OrderStatus.PROCESSING,
  'Out for delivery': OrderStatus.OUT_FOR_DELIVERY,
};

export function getShipmentStatus(order: OrderProps) {
  let status = null;
  const shipmentDetails = order.shipment_details;

  if (shipmentDetails) {
    const details = shipmentDetails.toLocaleLowerCase();
    if (details.includes('delivered')) {
      status = OrderStatus.DELIVERED;
    } else if (details.includes('in_transit')) {
      status = OrderStatus.SHIPPED;
    } else if (details.includes('pending')) {
      status = OrderStatus.PROCESSING;
    } else if (details.includes('has shipped')) {
      status = OrderStatus.SHIPPED;
    } else if (
      details.includes('on its way') &&
      order.order_status === 'Complete'
    ) {
      status = OrderStatus.SHIPPED;
    } else if (details.includes('in shipping')) {
      status = OrderStatus.IN_SHIPPING;
    } else if (details.includes('pre_transit')) {
      status = OrderStatus.PROCESSING;
    } else if (details.includes('out_for_delivery')) {
      status = OrderStatus.OUT_FOR_DELIVERY;
    } else {
      status = OrderStatus.PROCESSING;
    }
  }

  return status;
}
