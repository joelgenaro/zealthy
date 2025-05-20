import { InsuranceProvider } from '@/context/AppContext/reducers/types/insurance';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { usePatient } from './data';

export const useInsuranceProviders = () => {
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);

  useEffect(() => {
    if (!patient?.region) return;
    const getLiveProviders = async () => {
      const { data: payers } = await supabase
        .from('state_payer')
        .select('payer(id, name, external_payer_id)')
        .eq('state', patient?.region!)
        .eq('active', true);

      return payers?.map((item: any) => item.payer) || [];
    };

    getLiveProviders().then(payers => {
      setProviders(payers as InsuranceProvider[]);
    });
  }, [patient?.region, supabase]);

  return { providers, hasProviders: !!providers.length };
};
