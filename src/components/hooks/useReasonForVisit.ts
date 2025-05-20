import { ProfileState } from '@/context/AppContext/reducers/types/profile';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { useProfileSelect } from './useProfile';

const selectGender = (profile: ProfileState) => profile.gender;

export const useReasonForVisit = () => {
  const [reasons, setReasons] = useState<ReasonForVisit[]>([]);
  const supabase = useSupabaseClient<Database>();
  const gender = useProfileSelect(selectGender) || '';

  useEffect(() => {
    supabase
      .from('reason_for_visit')
      .select('id, reason, synchronous')
      .order('order', { ascending: true })
      .eq(gender, true)
      .then(({ data }) => {
        if (data) setReasons(data || []);
      });
  }, [gender, supabase]);

  return reasons;
};
