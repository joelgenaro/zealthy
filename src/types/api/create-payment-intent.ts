import Stripe from 'stripe';

export type CreatePaymentIntentRequest = {
  patientId: number;
  amount: number;
  metadata?: Record<string, unknown>;
  invoiceId?: string;
  userAgent?: string;
  isOneTimePayment?: boolean;
};

export type CreateInvoicePaymentRequest = {
  patientId: number;
  amount: number;
  metadata?: Record<string, unknown>;
  description: string;
  doNotCharge?: boolean;
  idempotencyKey: string;
};

export type CreatePaymentIntentResponse = {
  error: unknown;
  client_secret: string;
  status: Stripe.PaymentIntent.Status;
  intent_id: string;
  invoiceId?: string;
};
