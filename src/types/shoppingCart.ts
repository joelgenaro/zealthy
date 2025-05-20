import { ISubscription } from './subscription';
import { Visit } from './visit';

export interface IShoppingCart {
  visit: Visit;
  products: string[];
  subscriptions: ISubscription[];
}
