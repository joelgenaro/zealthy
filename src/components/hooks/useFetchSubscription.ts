import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

export const useFetchSubscription = (name: string) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', name)
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscription(data);
      });
  }, [name, supabase]);

  return subscription;
};
