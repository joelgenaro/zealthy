import {
  useAppDispatchContext,
  useAppStateContext,
} from '@/context/AppContext';
import { getPatientActions } from '@/context/AppContext/reducers/patient/actions';
import { PatientState } from '@/context/AppContext/reducers/types/patient';
import { Database } from '@/lib/database.types';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useCallback, useMemo } from 'react';
import { usePatient } from './data';
import { useQueryClient } from 'react-query';

export const usePatientActions = () => {
  const dispatch = useAppDispatchContext();
  const dispatchBoundActions = useMemo(
    () => getPatientActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};

export const usePatientState = () => {
  const state = useAppStateContext();

  const patient = useMemo(() => state.patient, [state.patient]);

  return patient;
};

export const usePatientSelect = <T>(
  selector: (patient: PatientState) => T
): T => {
  const patient = usePatientState();

  return selector(patient);
};

export type PatientInfo = Database['public']['Tables']['patient']['Update'];

type PatientUpsertInput = {
  profile_id: string;
  region: string;
  id?: number;
  timezone: string;
};

export const usePatientAsync = () => {
  const supabase = useSupabaseClient<Database>();
  const { updatePatient: updateLocalPatient } = usePatientActions();
  const { data: patient } = usePatient();
  const { region, id: patient_id } = usePatientState();
  const queryClient = useQueryClient();
  const user = useUser();

  const createPatient = useCallback(async () => {
    const patientInput: PatientUpsertInput = {
      profile_id: user!.id,
      region: region!,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const patientId = patient_id || patient?.id;

    if (patientId) {
      patientInput.id = patientId;
    }

    const { data, error } = await supabase
      .from('patient')
      .upsert(patientInput)
      .select('*')
      .single();

    if (data) {
      updateLocalPatient({ id: data.id, status: data.status });
      window.freshpaint?.identify(patient?.profiles?.id, {
        state: region,
        email: patient?.profiles?.email,
      });
      queryClient.invalidateQueries('patient');
    }

    if (error) console.error('createPatient_err', error);
  }, [
    patient?.profiles?.email,
    patient?.id,
    patient_id,
    queryClient,
    region,
    supabase,
    updateLocalPatient,
    user,
  ]);

  const updatePatient = useCallback(
    async (info: PatientInfo) => {
      updateLocalPatient(info);
      const { error } = await supabase
        .from('patient')
        .update({
          ...info,
        })
        .eq('id', patient?.id!);

      if (error) {
        console.error('usePatientAsync.updatePatient err', error);
      }
    },
    [patient?.id, supabase, updateLocalPatient]
  );

  return { createPatient, updatePatient };
};
