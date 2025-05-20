export type ReplaceSubscriptionRequestParams = {
  subscription: {
    id: number;
    reference_id: string;
    planId: string;
    trialEnd?: number;
  };
  patient_id: number;
};
