import {
  useAppDispatchContext,
  useAppStateContext,
} from '@/context/AppContext';
import { getProfileActions } from '@/context/AppContext/reducers/profile/actions';
import { ProfileState } from '@/context/AppContext/reducers/types/profile';
import { Database } from '@/lib/database.types';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import differenceInYears from 'date-fns/differenceInYears';
import { useCallback, useMemo } from 'react';
import { useQueryClient } from 'react-query';

const calculateAge = (birth_day: string | null) => {
  const now = new Date();
  const birthDay = birth_day ? new Date(birth_day) : now;

  return differenceInYears(now, birthDay);
};

export const useProfileActions = () => {
  const dispatch = useAppDispatchContext();
  const dispatchBoundActions = useMemo(
    () => getProfileActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};

export const useProfileState = () => {
  const state = useAppStateContext();

  const profile = useMemo(() => state.profile, [state.profile]);

  return {
    ...profile,
    age: calculateAge(profile.birth_date),
  };
};

export const useProfileSelect = <T>(selector: (profile: ProfileState) => T) => {
  const profile = useProfileState();

  return selector(profile);
};

export type ProfileInfo = Database['public']['Tables']['profiles']['Update'];

export const useProfileAsync = () => {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const queryClient = useQueryClient();

  return useCallback(
    async (info: ProfileInfo) => {
      await supabase.from('profiles').update(info).eq('id', user!.id);

      window.freshpaint?.identify(user?.id, {
        email: info.email,
        dob: info.birth_date,
        gender_at_birth: info.gender,
      });

      queryClient.invalidateQueries('patient');
    },
    [queryClient, supabase, user]
  );
};
