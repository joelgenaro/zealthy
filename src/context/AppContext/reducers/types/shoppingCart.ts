import { CommonAction } from './common';
import { ISimpleAppointment } from '@/types/appointment';
import { Visit } from '@/types/visit';

export interface ShoppingCartState {
  visit: Visit;
  visitDetails: ISimpleAppointment;
  products: string[];
  subscriptions: string[];
}

export enum ShoppingCartActionTypes {
  ADD_PRODUCT_TO_CART = 'ADD_PRODUCT_TO_CART',
  ADD_SUBSCRIPTION_TO_CART = 'ADD_SUBSCRIPTION_TO_CART',
  REMOVE_PRODUCT_FROM_CART = 'REMOVE_PRODUCT_FROM_CART',
  REMOVE_SUBSCRIPTION_FROM_CART = 'REMOVE_SUBSCRIPTION_FROM_CART',
  ADD_VISIT_TO_CART = 'ADD_VISIT_TO_CART',
  ADD_VISIT_DETAILS_TO_CART = 'ADD_VISIT_DETAILS_TO_CART',
}

export type ShoppingCartAction =
  | CommonAction
  | {
      type:
        | ShoppingCartActionTypes.ADD_PRODUCT_TO_CART
        | ShoppingCartActionTypes.ADD_SUBSCRIPTION_TO_CART
        | ShoppingCartActionTypes.REMOVE_PRODUCT_FROM_CART
        | ShoppingCartActionTypes.REMOVE_SUBSCRIPTION_FROM_CART;
      payload: string;
    }
  | {
      type: ShoppingCartActionTypes.ADD_VISIT_TO_CART;
      payload: Visit;
    }
  | {
      type: ShoppingCartActionTypes.ADD_VISIT_DETAILS_TO_CART;
      payload: ISimpleAppointment;
    };
