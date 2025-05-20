export type CreateChargeRefundRequest = {
  chargeId: string;
  refundAmount: number;
};

export type CreateChargeRefundResponse = {
  error: unknown;
  message: string;
};
