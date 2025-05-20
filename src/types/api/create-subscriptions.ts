export type CreateSubscriptionInput = {
  planId: string;
  id: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
};
export type UpgradeSubscriptionInput = {
  id: string;
  price_id: string;
};
export type CreateSubscriptionsRequest = {
  patient_id: number;
  subscriptions: CreateSubscriptionInput[];
};

export type CreateSubscriptionKlarna = {
  patient_id: number;
  subscription: CreateSubscriptionInput;
};

export type UpgradeSubscriptionsRequest = {
  patient_id: number;
  subscription: UpgradeSubscriptionInput;
};
