import { IShoppingCart } from '@/types/shoppingCart';
import { Visit } from '@/types/visit';
import { zealthySubscription } from './subscription';

export const ILVShoppingCart: IShoppingCart = {
  visit: Visit.ILV,
  products: [],
  subscriptions: [zealthySubscription],
};
