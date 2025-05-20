export interface PatientMembershipProps {
  subscription: Subscription;
  onSelect: (sub: Subscription) => void;
}

export type Subscription = {
  reference_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  price: number | null;
  interval: string | null;
  interval_count: number | null;
  subscription: {
    name: string | null;
    price: number | null;
    id: number;
    reference_id: string;
  };
};
