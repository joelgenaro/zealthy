import Stripe from 'stripe';

export type MedicationSubscriptionRequestParams = {
  patientId: number;
  cancel_at: number;
  price: number;
  recurring: Stripe.SubscriptionCreateParams.Item.PriceData.Recurring;
  orderId: number;
  drugCode?: string | null;
  idempotencyKey?: string;
};

export type MedicationSubscription = Stripe.Subscription;
