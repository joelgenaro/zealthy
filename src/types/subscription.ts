export enum SubscriptionType {
  ZEALTHY_ACCESS = 'Zealthy Access Fee',
  MEDICATION = 'Medication Subscription',
  COACHING = 'Coaching Subscription',
}

export interface ISubscription {
  id: number;
  name: string;
  processor: string;
  reference_id: string;
  type: SubscriptionType;
  price: number;
  discountedPrice?: number;
  monthFrequency: number;
}
