export type StripeIntentType = 'setup_intent' | 'payment_intent';

export type OutstandingBalanceSuccessResponse = {
  client_secret: string;
  status: string;
  error: null;
  type: StripeIntentType;
};
