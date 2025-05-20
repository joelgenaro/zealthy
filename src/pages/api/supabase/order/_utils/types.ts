import { Database } from '@/lib/database.types';
import { NonNullableField } from '@/types/utils/required';

export type Order = Database['public']['Tables']['order']['Row'];

export type NonNullableOrder = NonNullableField<
  Order,
  'patient_id' | 'prescription_id'
>;
