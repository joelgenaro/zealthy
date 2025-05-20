import { ICoupon } from './coupon';
import { IDelivery } from './delivery';
import { IPrescription } from './prescription';
import { ICareSelection } from './careSelection';
import { ISubscription } from './subscription';

export interface IOrder {
  subscription?: ISubscription;
  products: ICareSelection[];
  coupon?: ICoupon;
  delivery?: IDelivery;
  prescriptions?: IPrescription[];
}
