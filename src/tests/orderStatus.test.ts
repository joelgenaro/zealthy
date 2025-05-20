import { getShipmentStatus } from '@/utils/orderStatus';
import { OrderStatus } from '@/types/orderStatus';
import { OrderProps } from '../components/screens/Prescriptions/OrderHistoryContent';

describe('getShipmentStatus', () => {
  it('should return DELIVERED when shipment details contain "delivered"', () => {
    const order = {
      shipment_details: 'Package was successfully delivered',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.DELIVERED);
  });

  it('should return SHIPPED when shipment details contain "in_transit"', () => {
    const order = {
      shipment_details: 'The package is in_transit',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.SHIPPED);
  });

  it('should return PROCESSING when shipment details contain "pending"', () => {
    const order = {
      shipment_details: 'The shipment is pending',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.PROCESSING);
  });

  it('should return SHIPPED when shipment details contain "has shipped"', () => {
    const order = {
      shipment_details: 'The order status has shipped',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.SHIPPED);
  });

  it('should return SHIPPED when shipment details contain "on its way" and order status is "Complete"', () => {
    const order = {
      shipment_details: 'The order is on its way',
      order_status: 'Complete',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.SHIPPED);
  });

  it('should return IN_SHIPPING when shipment details contain "in shipping"', () => {
    const order = {
      shipment_details: 'Your order is in shipping',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.IN_SHIPPING);
  });

  it('should return PROCESSING when shipment details contain "pre_transit"', () => {
    const order = {
      shipment_details: 'Status: pre_transit',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.PROCESSING);
  });

  it('should return OUT_FOR_DELIVERY when shipment details contain "out_for_delivery"', () => {
    const order = {
      shipment_details: 'The package is out_for_delivery',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.OUT_FOR_DELIVERY);
  });

  it('should return PROCESSING when shipment details do not contain a specific status', () => {
    const order = {
      shipment_details: 'Unknown status',
    } as unknown as OrderProps;
    expect(getShipmentStatus(order)).toEqual(OrderStatus.PROCESSING);
  });

  it('should return null when there are no shipment details', () => {
    const order = {} as unknown as OrderProps;
    expect(getShipmentStatus(order)).toBeNull();
  });
});
