export type Patient = {
  id: number;
};

export type PaymentMethod = {
  id: string;
  last4: string | undefined;
  exp_month: number | undefined;
  exp_year: number | undefined;
  brand?: string;
};

export type DefaultPaymentMethodResponse = {
  paymentMethod: PaymentMethod | null;
};
