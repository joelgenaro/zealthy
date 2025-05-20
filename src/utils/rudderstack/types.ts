import { Database } from '@/lib/database.types';

export type PurchaseType = {
  coaching:
    | {
        name: string;
        price: number;
      }[]
    | null;

  medications:
    | {
        name: string;
        price: number;
      }[]
    | null;

  appointment: {
    type: Database['public']['Enums']['encounter_type'];
    doctor: string | null;
    starts_at: string | null;
    ends_at: string | null;
  } | null;
};
