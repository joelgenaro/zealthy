import { IOrder } from '@/types/order';
import { freeDelivery } from './delivery';
import prescriptions from './prescriptions';
import { maleSelections as products } from './careSelections';
import { zealthySubscription } from './subscription';

export const orderWithSubscription: IOrder = {
  subscription: zealthySubscription,
  products: products,
  delivery: freeDelivery,
};

export const orderWithMedication: IOrder = {
  subscription: zealthySubscription,
  products: products,
  delivery: freeDelivery,
  prescriptions: prescriptions,
};

export const orderWithoutSubscription: IOrder = {
  products: [products[5]],
  delivery: freeDelivery,
};
