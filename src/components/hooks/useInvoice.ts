import { useCallback } from 'react';
import { usePatientState } from './usePatient';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export type InvoiceType = Database['public']['Tables']['invoice']['Update'];

export const useInvoice = () => {
  const supabase = useSupabaseClient<Database>();
  const patientId = usePatientState().id;

  const getInvoices = useCallback(async (): Promise<{
    data: InvoiceType[] | null;
    error: any;
  }> => {
    const { data, error } = await supabase
      .from('invoice')
      .select('*')
      .eq('patient_id', patientId);

    if (error) {
      console.error('getInvoices err', error);
    }

    return { data, error };
  }, [supabase, patientId]);

  // Generalize in future to search for specific discount amount and/or specific description
  const hasPaidInvoiceWithFirstMonthDiscount = useCallback(
    async (discountAmount: number = 39): Promise<boolean> => {
      const { data, error } = await supabase
        .from('invoice')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'paid')
        .eq('amount_paid', discountAmount)
        .ilike('description', 'first month weight loss membership');

      if (error) {
        console.error('hasPaidInvoiceWithDiscount database error', error);
      }

      return (data?.length ?? 0) > 0;
    },
    [supabase, patientId]
  );

  return { getInvoices, hasPaidInvoiceWithFirstMonthDiscount };
};
