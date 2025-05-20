import { ISimpleAppointment } from '@/types/appointment';
import { Visit } from '@/types/visit';
import { Dispatch } from 'react';
import {
  ShoppingCartAction,
  ShoppingCartActionTypes,
} from '../types/shoppingCart';

export const getShoppingCartActions = (
  dispatch: Dispatch<ShoppingCartAction>
) => ({
  addVisitToCart: (payload: Visit) =>
    dispatch({
      type: ShoppingCartActionTypes.ADD_VISIT_TO_CART,
      payload,
    }),
  addVisitDetailsToCart: (payload: ISimpleAppointment) =>
    dispatch({
      type: ShoppingCartActionTypes.ADD_VISIT_DETAILS_TO_CART,
      payload,
    }),
  addProductToCart: (payload: string) =>
    dispatch({
      type: ShoppingCartActionTypes.ADD_PRODUCT_TO_CART,
      payload,
    }),
  removeProductFromCart: (payload: string) =>
    dispatch({
      type: ShoppingCartActionTypes.REMOVE_PRODUCT_FROM_CART,
      payload,
    }),
  addSubscriptionToCart: (payload: string) =>
    dispatch({
      type: ShoppingCartActionTypes.ADD_SUBSCRIPTION_TO_CART,
      payload,
    }),
  removeSubscriptionFromCart: (payload: string) =>
    dispatch({
      type: ShoppingCartActionTypes.REMOVE_SUBSCRIPTION_FROM_CART,
      payload,
    }),
});
