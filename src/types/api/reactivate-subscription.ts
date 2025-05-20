import Stripe from 'stripe';

export type UpdateSubscriptionRequestParams = {
  subscriptionId: string;
};

export type UpdateSubscriptionResponse = {
  subscription: Stripe.Subscription;
};

export type UpdateSubscriptionResponseError = {
  message: string;
  error: unknown;
};
