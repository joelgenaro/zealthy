import { ISimpleAppointment } from '@/types/appointment';
import { CommonActionTypes } from '../types/common';
import { IAppState } from '../types/appState';
import { Visit } from '@/types/visit';
import {
  ShoppingCartAction,
  ShoppingCartActionTypes,
  ShoppingCartState,
} from '../types/shoppingCart';

export const shoppingCartInitialState: ShoppingCartState = {
  visit: Visit.NONE,
  visitDetails: {} as ISimpleAppointment,
  products: [],
  subscriptions: [],
};

const shoppingCartReducer = (
  state: ShoppingCartState,
  action: ShoppingCartAction
): ShoppingCartState => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return {
        ...state,
        ...(action.payload as IAppState).shoppingCart,
      };
    case ShoppingCartActionTypes.ADD_VISIT_TO_CART:
      return {
        ...state,
        visit: action.payload,
      };
    case ShoppingCartActionTypes.ADD_VISIT_DETAILS_TO_CART:
      return {
        ...state,
        visitDetails: action.payload,
      };
    case ShoppingCartActionTypes.ADD_PRODUCT_TO_CART:
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    case ShoppingCartActionTypes.REMOVE_PRODUCT_FROM_CART:
      return {
        ...state,
        products: state.products.filter(product => product !== action.payload),
      };
    case ShoppingCartActionTypes.ADD_SUBSCRIPTION_TO_CART:
      return {
        ...state,
        subscriptions: [...state.subscriptions, action.payload],
      };
    case ShoppingCartActionTypes.REMOVE_SUBSCRIPTION_FROM_CART:
      return {
        ...state,
        subscriptions: state.subscriptions.filter(
          subscription => subscription !== action.payload
        ),
      };
    default:
      return state;
  }
};

export default shoppingCartReducer;
