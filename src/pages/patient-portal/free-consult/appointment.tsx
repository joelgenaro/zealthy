import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { usePatient } from '@/components/hooks/data';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  PractitionerWithSchedule,
  useProviderSchedule,
} from '@/components/hooks/useProviderSchedule';
import { CanvasSlot } from '@/components/shared/AvailableTimeSlots';
import HealthCheckupLoading from '@/components/shared/Loading/HealthCheckupLoading';
import ProviderSchedule from '@/components/shared/ProviderSchedule';
import { Pathnames } from '@/types/pathnames';
import { Container, Grid, Typography } from '@mui/material';
import Router from 'next/router';
import { useCallback, useState, ReactElement } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

interface FreeConsultScheduleProps {
  onSelect: (nextPage: string | undefined) => void;
}

const FreeConsultProviderSchedule = ({
  onSelect,
}: FreeConsultScheduleProps) => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const { createAppointment } = useAppointmentAsync();
  const { loading, practitioners } = useProviderSchedule({
    type: 'Provider',
    duration: 15,
  });
  const { potentialInsurance } = useIntakeState();
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

  const handleScheduleAppointment = useCallback(
    async (slot: CanvasSlot, practitioner: PractitionerWithSchedule) => {
      if (isSlotSelected) return;
      setIsSlotSelected(true);

      //Track that they have scheduled an appointment
      if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
        window.freshpaint?.track('wl-free-consult-appointment-scheduled');
      }
      //Schedule the appointment
      await createAppointment(
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
          duration: 15,
          care: SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT,
        },
        patient!
      );
      //Make the dummy prescription request
      await supabase.from('prescription_request').insert({
        patient_id: patient?.id,
        status: 'REQUESTED',
        note: 'Approve or Deny, DO NOT PRESCRIBE',
        specific_medication:
          'Approve or Deny 3 Month Jumpstart For New Patient during the scheduled free consult appointment',
        charge: false,
      });

      return Router.push(Pathnames.PATIENT_PORTAL);
    },
    [createAppointment, onSelect, potentialInsurance, isSlotSelected, patient]
  );

  const filteredPractitioners = practitioners.filter(
    p => p.clinician.free_consult_eligible
  );

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        <Typography variant="h2">Please schedule your remote visit.</Typography>

        <Grid container direction="column" gap="33px" alignItems="center">
          {loading ? (
            <HealthCheckupLoading />
          ) : (
            filteredPractitioners.map((p, i) => (
              <ProviderSchedule
                index={i}
                specialties={p.clinician.specialties!}
                key={p.clinician.id}
                practitioner={p}
                onSelect={handleScheduleAppointment}
                hideBios={true}
                isSlotSelected={isSlotSelected}
              />
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

FreeConsultProviderSchedule.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default FreeConsultProviderSchedule;
