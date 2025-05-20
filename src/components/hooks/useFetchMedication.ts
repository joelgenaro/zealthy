import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { MedicationPayload } from '@/types/medicationPayload';

const MEDICATION_QUERY = `
  medication_dosage!inner(
    dosage!inner(dosage),
    medication_quantity!inner(
      quantity!inner(quantity),
      price,
      id
    )
  )
`;

export const useFetchMedication = (
  medicationName: string,
  dosage?: string,
  quantity?: number
) => {
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(false);
  const [medication, setMedication] = useState<{
    price: number;
    medication_quantity_id: number;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('medication')
      .select(MEDICATION_QUERY)
      .eq('name', medicationName);

    if (dosage) {
      query = query.eq('medication_dosage.dosage.dosage', dosage);
    }

    if (quantity) {
      query = query.eq(
        'medication_dosage.medication_quantity.quantity.quantity',
        quantity
      );
    }

    query
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const response = (data as MedicationPayload)?.medication_dosage?.[0]
          .medication_quantity?.[0];

        if (response) {
          setMedication({
            medication_quantity_id: response?.id,
            price: response?.price,
          });
        }
      })
      .then(() => setLoading(false));
  }, [dosage, medicationName, quantity, supabase]);

  return { loading, medication };
};
