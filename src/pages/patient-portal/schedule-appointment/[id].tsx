import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import {
  AppointmentPayload,
  AppointmentState,
} from '@/context/AppContext/reducers/types/appointment';
import { mapPayloadToAppointment } from '@/context/AppContext/utils/mapPayloadToAppointment';
import { APPOINTMENT_QUERY } from '@/context/AppContext/query';

import ScheduleFollowUp from '@/components/screens/ScheduleFollowUp/ScheduleFollowUp';

type Patient = {
  id: number | null | undefined;
};

const ScheduleFollowUpPage = () => {
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  const [appointment, setAppointment] = useState<AppointmentState | null>(null);
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const { id } = router.query;

  async function fetchPatient() {
    const patient = await supabase
      .from('patient')
      .select('id')
      .eq('profile_id', user?.id!)
      .single();

    setPatientInfo(patient.data as Patient);
  }

  useEffect(() => {
    if (!id) {
      return;
    }
    supabase
      .from('appointment')
      .select(APPOINTMENT_QUERY)
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data)
          setAppointment(mapPayloadToAppointment(data as AppointmentPayload));
      });
  }, [id, supabase]);

  useEffect(() => {
    if (patientInfo === null) {
      fetchPatient();
    }
  }, [patientInfo]);

  if (!appointment) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <ScheduleFollowUp
        appointmentInfo={{
          id: appointment.id,
          starts_at: appointment.starts_at,
          duration: appointment.duration,
          status: appointment.status,
        }}
        onBack={() => Router.push(Pathnames.PATIENT_PORTAL)}
      />
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

ScheduleFollowUpPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ScheduleFollowUpPage;
