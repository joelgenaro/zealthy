export type RenewSubscriptionRequestParams = {
  subscription: {
    id: number;
    reference_id: string;
    planId: string;
    trialEnd?: number;
  };
  patient_id: number;
  coupon?: string;
};
