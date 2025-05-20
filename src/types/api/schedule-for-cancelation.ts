export type MarkSubscriptionForCancelationRequest = {
  subscriptionId: string;
  cancelationReason?: string | null;
  cancelChoiceReasons: string[] | null;
};
