import {
  useAppDispatchContext,
  useAppStateContext,
} from '@/context/AppContext';
import { APPOINTMENT_QUERY } from '@/context/AppContext/query';
import { getAppointmentActions } from '@/context/AppContext/reducers/appointment/actions';
import {
  AppointmentPayload,
  AppointmentState,
  ProviderType,
} from '@/context/AppContext/reducers/types/appointment';
import { mapPayloadToAppointment } from '@/context/AppContext/utils/mapPayloadToAppointment';
import { Database } from '@/lib/database.types';
import { mapAppointmentTypeToCare } from '@/utils/mapAppointmentTypeToCare';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useMemo } from 'react';
import { PatientProps, PatientSubscriptionProps } from './data';
import { useInsuranceState } from './useInsurance';
import useInterval from './useInterval';

import { useVisitSelect } from './useVisit';
import { useIntakeState } from './useIntake';

import axios from 'axios';

export const useAppointmentState = () => {
  const state = useAppStateContext();

  const appointment = useMemo(() => state.appointment, [state.appointment]);

  return appointment;
};

export const useAppointmentActions = () => {
  const dispatch = useAppDispatchContext();

  const dispatchBoundActions = useMemo(
    () => getAppointmentActions(dispatch),
    [dispatch]
  );

  const addAppointment = useCallback(
    (a: AppointmentState) => {
      dispatchBoundActions.addAppointment({
        id: a.id,
        appointment_type: a.appointment_type,
        duration: a.duration,
        location: a.location,
        encounter_type: a.encounter_type,
        status: a.status,
        provider: a.provider,
        payer_name: a.payer_name || null,
        starts_at: a.starts_at,
        ends_at: a.ends_at,
        visit_type: a.visit_type,
        description: a.description,
        canvas_appointment_id: a.canvas_appointment_id,
        daily_room: a.daily_room,
        onsched_appointment_id: a.onsched_appointment_id,
        last_automated_call: a.last_automated_call || null,
      });
    },
    [dispatchBoundActions]
  );

  return { ...dispatchBoundActions, addAppointment };
};

export const useAppointmentSelect = <T>(
  selector: (appointments: AppointmentState[]) => T
) => {
  const appointments = useAppointmentState();

  return selector(appointments);
};

type AppointmentInsert = {
  appointment_type: Database['public']['Enums']['appointment_type'];
  type: Database['public']['Enums']['encounter_type'];
  provider?: ProviderType;
  starts_at?: string;
  ends_at?: string;
  duration: number;
  status?: Database['public']['Enums']['appointment_status'];
  visit_type?: Database['public']['Enums']['visit_type'];
  canvas_appointment_id?: string;
  calendarId?: string | null | undefined;
  description?: string;
  care?: string;
};

type AppointmentUpdate = Database['public']['Tables']['appointment']['Update'];

export const useAppointmentAsync = () => {
  const actions = useAppointmentActions();
  const { hasINInsurance } = useInsuranceState();
  const { potentialInsurance } = useIntakeState();
  const selectedCare = useVisitSelect(visit => visit.selectedCare);
  const supabase = useSupabaseClient<Database>();
  const careForAppointment = useAppointmentCare();

  const createAppointment = useCallback(
    async (a: AppointmentInsert, patient: PatientProps) => {
      if (!patient) return;
      const care = mapAppointmentTypeToCare(a.appointment_type, selectedCare);
      const visitInfo =
        a.appointment_type === 'Provider'
          ? `Seeking: ${care}, Location: ${
              patient?.region
            }, In-network Insurance: ${
              hasINInsurance ||
              ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
                potentialInsurance || ''
              )
            }`
          : care;

      let appointmentCare = selectedCare?.careSelections[0]?.reason;

      if (!appointmentCare) {
        appointmentCare = await careForAppointment(patient.id);
      }

      const { data } = await supabase
        .from('appointment')
        .insert([
          {
            appointment_type: a.appointment_type,
            encounter_type: a.type,
            patient_id: patient?.id,
            duration: a.duration,
            location: patient?.region!,
            status: a.status || 'Confirmed',
            clinician_id: a.provider?.id || null,
            starts_at: a.starts_at || null,
            ends_at: a.ends_at || null,
            visit_type: a.visit_type || null,
            description:
              visitInfo + (a.description ? ` - ${a.description}` : ''),
            calendarId: a.calendarId,
            care: a.care ?? appointmentCare,
          },
        ])
        .select(APPOINTMENT_QUERY)
        .single();

      if (data) {
        const appointment = mapPayloadToAppointment(data as AppointmentPayload);
        actions.addAppointment({
          ...appointment,
          provider: {
            ...appointment.provider,
            specialties:
              a.provider?.specialties || appointment.provider?.specialties,
          },
        } as AppointmentState);
        const onschedAppt = await axios.post(
          `/api/onsched/create-appointment?completeBooking=${
            data?.status === 'Confirmed' ? 'BK' : 'IN'
          }`,
          {
            StartDateTime: a.starts_at,
            EndDateTime: a.ends_at,
            resourceId: a.provider?.onsched_resource_id,
            BookedBy: patient?.profiles?.id,
            email: patient?.profiles?.email,
            name: `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`,
          }
        );

        await supabase
          .from('appointment')
          .update({ onsched_appointment_id: onschedAppt?.data?.id })
          .eq('id', data?.id);

        return appointment;
      }

      return null;
    },
    [selectedCare, hasINInsurance, supabase, actions]
  );

  const updateAppointment = useCallback(
    async (id: number, info: AppointmentUpdate, patient: PatientProps) => {
      const { data } = await supabase
        .from('appointment')
        .update({
          ...info,
        })
        .eq('id', id)
        .select(APPOINTMENT_QUERY)
        .single();

      if (data)
        actions.updateAppointment(
          mapPayloadToAppointment(data as AppointmentPayload)
        );

      if (info?.status === 'Confirmed') {
        await axios.put('/api/onsched/update-appointment', {
          appointmentId: data?.onsched_appointment_id,
          email: patient?.profiles?.email,
          name: `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`,
          action: 'book',
        });
      }
      return data;
    },
    [actions, supabase]
  );

  return {
    createAppointment,
    updateAppointment,
  };
};
//find proper care for appointment
//it could be weight loss or personalized psychiatry - mental health
export const useAppointmentCare = () => {
  const supabase = useSupabaseClient<Database>();

  return useCallback(
    async (patientId: number) => {
      const subscriptions = await supabase
        .from('patient_subscription')
        .select('*, subscription(*)')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .then(({ data }) => (data || []) as PatientSubscriptionProps[]);

      if (
        subscriptions.find(sub => sub.subscription.name.includes('Weight Loss'))
      ) {
        return 'Weight loss';
      }

      if (
        subscriptions.find(sub =>
          [
            'Zealthy Personalized Psychiatry',
            'Mental Health Coaching',
          ].includes(sub.subscription.name)
        )
      ) {
        return 'Anxiety or depression';
      }

      return 'Primary care';
    },
    [supabase]
  );
};

export const useAppointmentPolling = (
  appointment: AppointmentState | undefined
) => {
  const supabase = useSupabaseClient<Database>();
  const { updateAppointment } = useAppointmentActions();

  const enableAppointmentPolling = useMemo(() => {
    if (
      appointment?.encounter_type === 'Walked-in' &&
      ['Unassigned', 'Confirmed', 'Checked-in'].includes(
        appointment?.status || ''
      )
    ) {
      return true;
    }
    return false;
  }, [appointment]);

  const fetchAppointment = useCallback(async () => {
    const { data } = await supabase
      .from('appointment')
      .select(APPOINTMENT_QUERY)
      .eq('id', appointment!.id)
      .single();

    if (data) {
      updateAppointment(mapPayloadToAppointment(data as AppointmentPayload));
      return data;
    }
  }, [appointment, supabase, updateAppointment]);

  useInterval(
    () => {
      if (enableAppointmentPolling) {
        fetchAppointment();
      }
    },
    enableAppointmentPolling ? 60000 : null
  );
};
