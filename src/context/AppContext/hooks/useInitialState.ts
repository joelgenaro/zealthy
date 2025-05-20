import {
  APPOINTMENT_QUERY,
  PATIENT_QUERY,
  PROFILE_QUERY,
} from '@/context/AppContext/query';
import { IAppState } from '@/context/AppContext/reducers/types/appState';
import {
  mapDataToPayload,
  PayloadType,
} from '@/context/AppContext/utils/payload';
import { Database } from '@/lib/database.types';
import { User, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';
import { AppointmentPayload } from '../reducers/types/appointment';
import isEqual from 'lodash/isEqual';
import { ProfileState } from '../reducers/types/profile';
import { InsurancePayload } from '../reducers/types/insurance';
import { PatientSubscriptionProps } from '@/components/hooks/data';
import { ReasonForVisit } from '../reducers/types/visit';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';

export type VisitPayload = {
  id: number;
  isSync: boolean;
  careSelected: ReasonForVisit[];
  intakes: IntakeType[];
};

export const VISIT_QUERY = `
  id,
  isSync: synchronous,
  careSelected: reason_for_visit(id, reason),
  intakes
`;

export const useInitialState = () => {
  const supabase = useSupabaseClient<Database>();

  // fetch initial state from localStorage
  const stateFromLocalStorage = useCallback(
    (): Promise<IAppState> =>
      new Promise((resolve, reject) => {
        const localState = sessionStorage.getItem('zealthy-app-state');
        if (localState && JSON.parse(localState)) {
          resolve(JSON.parse(localState));
        } else {
          reject();
        }
      }),
    []
  );

  const updateLocalState = useCallback(
    (state: IAppState) => {
      stateFromLocalStorage()
        .then(localState => {
          if (!isEqual(state, localState)) {
            sessionStorage.setItem('zealthy-app-state', JSON.stringify(state));
          }
        })
        .catch((e: unknown) => console.error('updateLocalStateErr', e ?? ''));
    },
    [stateFromLocalStorage]
  );

  // fetch initial state from DB
  const stateFromDB = useCallback(
    async (user: User, defaultState: IAppState) => {
      const [patient, profile] = await Promise.all([
        supabase
          .from('patient')
          .select(PATIENT_QUERY)
          .eq('profile_id', user.id)
          .maybeSingle()
          .then(({ data }) => data),

        supabase
          .from('profiles')
          .select(PROFILE_QUERY)
          .eq('id', user!.id)
          .single()
          .then(({ data }) => data && (data as ProfileState)),
      ]);

      if (!patient) {
        return {
          ...defaultState,
          ...mapDataToPayload({
            coaching: null,
            patient,
            profile: {
              ...profile,
              birth_date:
                defaultState.profile.birth_date || profile?.birth_date,
            },
            appointment: null,
            insurance_policy: null,
          } as PayloadType),
        };
      }

      const [appointment, coaching, insurance_policy, visit] =
        await Promise.all([
          supabase
            .from('appointment')
            .select(APPOINTMENT_QUERY)
            .eq('patient_id', patient.id)
            .in('status', [
              'Confirmed',
              'Rejected',
              'Unassigned',
              'Noshowed',
              'Completed',
            ])
            .order('created_at', { ascending: false })
            .then(({ data }) => data && (data as AppointmentPayload[])),

          supabase
            .from('patient_subscription')
            .select('*, subscription!inner(*)')
            .eq('patient_id', patient.id)
            .eq('status', 'active')
            .in('subscription.name', [
              'Mental Health Coaching',
              'Zealthy Weight Loss',
            ])
            .then(({ data }) => (data || []) as PatientSubscriptionProps[]),
          supabase
            .from('insurance_policy')
            .select('*, payer(id, name, external_payer_id)')
            .eq('patient_id', patient.id)
            .maybeSingle()
            .then(({ data }) => data && (data as InsurancePayload)),

          supabase
            .from('online_visit')
            .select(VISIT_QUERY)
            .eq('patient_id', patient.id)
            .eq('status', 'Paid')
            .order('created_at', { ascending: false })
            .then(({ data }) => (data || []) as VisitPayload[]),
        ]);

      return {
        ...defaultState,
        ...mapDataToPayload({
          coaching,
          patient,
          profile: {
            ...profile,
            birth_date: defaultState.profile.birth_date || profile?.birth_date,
          },
          appointment,
          insurance_policy,
          visit,
        } as PayloadType),
      };
    },
    [supabase]
  );

  const setInitialState = useCallback(
    async (user: User, defaultState: IAppState) => {
      const initialState = await stateFromLocalStorage()
        .catch(() => stateFromDB(user, defaultState))
        .catch(() => defaultState);

      sessionStorage.setItem('zealthy-app-state', JSON.stringify(initialState));

      return initialState;
    },
    [stateFromDB, stateFromLocalStorage]
  );

  const resetState = useCallback(() => {
    sessionStorage.removeItem('zealthy-app-state');
  }, []);

  return {
    setInitialState,
    resetState,
    updateLocalState,
  };
};
