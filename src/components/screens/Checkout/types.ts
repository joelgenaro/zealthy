import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { ConsultationType } from '@/context/AppContext/reducers/types/consultation';
import Stripe from 'stripe';

export type Order = {
  coaching: {
    planId: string;
    price: number;
    name: string;
    id: number;
    type: CoachingType;
    require_payment_now: boolean;
  }[];
  medications: {
    discounted?: boolean;
    price: number;
    name: string;
    medication_quantity_id: number | null;
    require_payment_now: boolean;
  }[];
  subscriptions: {
    id: number;
    price: number;
    planId: string;
    require_payment_now: boolean;
  }[];
  visit: {
    id: number; // appointment id
    price: number;
    require_payment_now: boolean;
  } | null;
  consultation: {
    type: ConsultationType;
    price: number;
    require_payment_now: boolean;
  }[];
};

export type PaymentAddonResponseData =
  | {
      subscription: Stripe.Response<Stripe.Subscription>;
    }
  | {
      message: string;
      description?: string;
    };
