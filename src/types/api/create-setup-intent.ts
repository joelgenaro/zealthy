import Stripe from 'stripe';

export type CreateSetupIntentRequest = {
  patientId: number;
};

export type CreateSetupIntentResponse = {
  error: unknown;
  client_secret: string;
  status: Stripe.SetupIntent.Status;
};
