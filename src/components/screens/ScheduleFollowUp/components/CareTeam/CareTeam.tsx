import { Grid, Typography } from '@mui/material';
import { useUser } from '@supabase/auth-helpers-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import Loading from '@/components/shared/Loading/Loading';

import {
  PractitionerWithSchedule,
  useProviderSchedule,
} from '@/components/hooks/useProviderSchedule';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import { useCallback, useEffect, useState } from 'react';
import { ProviderAddOn } from '@/components/shared/AddOnPayment';
import ProviderSchedule, { CanvasSlot } from '../ProviderSchedule';
import { usePatient } from '@/components/hooks/data';
import { addHours, format, subDays } from 'date-fns';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

interface Props {
  appointmentInfo: {
    id: number;
    starts_at: string | null;
    duration: number;
    status: string;
  };
  onBack: () => void;
}
interface AppointmentProps {
  id: number;
  starts_at: string;
  ends_at: string;
  description: string;
  duration: number;
  provider: {
    id: number;
    type: string[];
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string;
    zoom_link: string;
    daily_room: string;
    canvas_practitioner_id: string;
  };
}

interface PatientProps {
  id: number;
  canvas_patient_id: string;
}
const CareTeam = ({ onBack, appointmentInfo }: Props) => {
  const user = useUser();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const { practitioners } = useProviderSchedule({
    type: 'Provider',
    duration: appointmentInfo.duration,
    starts_at:
      subDays(new Date(appointmentInfo.starts_at || ''), 15) >
      addHours(new Date(), 3)
        ? format(
            subDays(new Date(appointmentInfo.starts_at || ''), 15),
            'yyyy-MM-dd'
          )
        : format(new Date(), 'yyyy-MM-dd'),
  });
  const { createAppointment } = useAppointmentAsync();
  const [appointment, setAppointment] = useState<AppointmentProps | null>(null);
  const [page, setPage] = useState('provider');
  const [patientInfo, setPatientInfo] = useState<PatientProps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleScheduleAppointment = useCallback(
    async (slot: CanvasSlot, practitioner: PractitionerWithSchedule) => {
      const appointment = await createAppointment(
        {
          type: 'Scheduled',
          appointment_type: 'Provider',
          provider: {
            id: practitioner?.clinician?.id,
            first_name: practitioner?.clinician?.profiles.first_name,
            last_name: practitioner?.clinician.profiles.last_name,
            avatar_url: practitioner?.clinician.profiles.avatar_url,
            specialties: practitioner?.clinician.specialties,
            zoom_link: practitioner?.clinician.zoom_link,
            daily_room: practitioner?.clinician.daily_room,
            canvas_practitioner_id:
              practitioner?.clinician.canvas_practitioner_id,
            email: practitioner?.clinician.profiles.email,
            onsched_resource_id:
              practitioner?.clinician?.profiles?.onsched_resource_id,
          },
          starts_at: slot.start,
          ends_at: slot.end,
          status: 'Confirmed',
          duration: appointmentInfo.duration,
        },
        patient!
      );

      setAppointment(appointment as any);
      if (!['Provider-Noshowed'].includes(appointmentInfo.status ?? '')) {
        setPage('confirm');
      } else {
        Router.push(Pathnames.PATIENT_PORTAL_VISIT_CONFIRMATION);
      }
    },
    []
  );
  async function confirmAppointment() {
    if (!appointment?.id) {
      return;
    }
    setLoading(true);
    await supabase
      .from('appointment')
      .update({
        status: 'Confirmed',
      })
      .eq('id', appointment?.id);

    if (!['Provider-Noshowed'].includes(appointmentInfo.status ?? '')) {
      await supabase
        .from('appointment')
        .update({
          status: 'Cancelled',
          cancelation_reason: `Rescheduled with appointment: ${appointment?.id}`,
          canceled_at: new Date().toISOString(),
        })
        .eq('id', appointmentInfo.id);
    }
    setLoading(false);
    onBack();
  }

  async function fetchPatientInfo() {
    if (!user?.id) {
      return;
    }
    const patient = await supabase
      .from('patient')
      .select()
      .eq('profile_id', user?.id)
      .single();
    setPatientInfo(patient.data as PatientProps);
  }
  useEffect(() => {
    if (patientInfo === null) {
      fetchPatientInfo();
    }
  }, [patientInfo]);

  return (
    <Grid container direction="column" gap="33px" alignItems="center">
      {page === 'provider' && (
        <>
          <Typography variant="h2">
            Please request your remote visit.
          </Typography>
          {loading && <Loading />}
          {practitioners.map(p => (
            <ProviderSchedule
              appointmentInfo={appointmentInfo}
              key={p.clinician.id}
              practitioner={p}
              onSelect={handleScheduleAppointment}
            />
          ))}
        </>
      )}
      {page === 'confirm' && (
        <>
          <ProviderAddOn
            appointment={appointment}
            patient={patientInfo}
            loading={loading}
            onSubmit={confirmAppointment}
            onBack={() => setPage('provider')}
          />
        </>
      )}
    </Grid>
  );
};

export default CareTeam;
