import { OtherOption } from '@/context/AppContext/reducers/types/visit';

export type MedicationName =
  | 'Viagra'
  | 'Sildenafil (Generic Viagra)'
  | 'Tadalafil (Generic Cialis)'
  | 'Sildenafil Chew'
  | 'Tadalafil Chew'
  | 'Sildenafil Mint'
  | 'Tadalafil Mint'
  | 'Sildenafil + Tadalafil Zealthy Hardies'
  | 'Sildenafil + Oxytocin Zealthy Hardies'
  | 'Tadalafil + Oxytocin Zealthy Hardies'
  | 'Tadalafil + Vardenafil Zealthy Hardies'
  | 'Sildenafil Hardies'
  | 'Tadalafil Hardies';

type Quantity = {
  popular: boolean;
  display_name: string;
  subheader?: string;
  value: number;
  medication_quantity_id: number;
  otherOptions: OtherOption[];
};

export type MedicationDosageQuantity = {
  [key in MedicationName]: {
    [key: string]: {
      recommended: boolean;
      quantities: Quantity[];
      price: number;
    };
  };
};
