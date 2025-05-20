type PaymentSource = {
  source: string;
};

type DefaultPaymentMethod = {
  payment_method: string;
  invoice_settings: {
    default_payment_method: string;
  };
};

export type StripeIntentType = 'setup_intent' | 'payment_intent';

export type StripeIntent = {
  clientSecret: string;
  type: StripeIntentType;
} | null;

export type CheckoutSuccessResponse = {
  client_secret: string;
  status: string;
  error: null;
  type: StripeIntentType;
};

export type CheckoutFailedResponse = {
  message: string;
  description?: string;
  error: any;
};

export type Patient = {
  id: number;
  fullName: string;
  email: string;
  region: string;
};

export type CheckoutRequestData = {
  paymentMethodId: string;
  amount: number;
  patient: Patient;
  metadata?: Record<string, unknown>;
  description?: string;
  // couponName?: string;
};

export type StripePaymentType = PaymentSource | DefaultPaymentMethod;
