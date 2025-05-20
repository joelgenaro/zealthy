import { Grid } from '@mui/material';
import Loading from '@/components/shared/Loading/Loading';
import ProviderSchedule from '@/components/shared/ProviderSchedule';
import {
  PractitionerWithSchedule,
  useProviderSchedule,
} from '@/components/hooks/useProviderSchedule';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import { useInsuranceState } from '@/components/hooks/useInsurance';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useCallback, useRef, useState } from 'react';
import { CanvasSlot } from '@/components/shared/AvailableTimeSlots';
import { usePatient } from '@/components/hooks/data';
import { useVisitTypeContext } from '@/components/screens/PatientPortal/components/ScheduleVisit/components/CareTeam/VisitTypeContext';

interface Props {
  show?: boolean;
}

const CareTeam = ({ show = true }: Props) => {
  const { data: patient } = usePatient();
  const { appointment } = Router.query;
  const { hasINInsurance } = useInsuranceState();
  const divRef = useRef<HTMLDivElement>(null);
  const { selectedVisitType } = useVisitTypeContext();

  const { practitioners, loading } = useProviderSchedule({
    type: 'Provider',
    duration:
      selectedVisitType === 'provider-call' ? 15 : hasINInsurance ? 45 : 30,
  });

  const questionnaires = useVisitSelect(visit => visit.questionnaires);
  const { createAppointment } = useAppointmentAsync();
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

  const handleScheduleAppointment = useCallback(
    async (slot: CanvasSlot, practitioner: PractitionerWithSchedule) => {
      if (isSlotSelected) return;
      setIsSlotSelected(true);
      console.log(slot, practitioner, 'slotPract123');
      const create = await createAppointment(
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
          status: 'Requested',
          duration:
            selectedVisitType === 'provider-call'
              ? 15
              : hasINInsurance
              ? 45
              : 30,
        },
        patient!
      );

      if (!!questionnaires.length) {
        Router.push(
          `${Pathnames.PATIENT_PORTAL}/${Pathnames.QUESTIONNAIRES}/${questionnaires[0].name}`
        );
      } else if (patient?.has_completed_onboarding) {
        if (appointment) {
          Router.push(
            `${Pathnames.PATIENT_PORTAL_VISIT_CONFIRMATION}?appt=${appointment}`
          );
        }

        if (selectedVisitType !== 'provider-call') {
          Router.push(Pathnames.PATIENT_PORTAL_ADD_ON_VISIT);
        } else {
          Router.push(Pathnames.PATIENT_PORTAL_VISIT_CONFIRMATION);
        }
      }
    },
    [patient, isSlotSelected]
  );

  if (!show) return null;

  return (
    <Grid container direction="column" gap="33px" alignItems="center">
      {loading && <Loading />}
      {practitioners.map((p, i) => (
        <ProviderSchedule
          index={i}
          specialties={p?.clinician?.specialties!}
          key={p?.clinician?.id}
          practitioner={p}
          onSelect={handleScheduleAppointment}
          isSlotSelected={isSlotSelected}
        />
      ))}
      <div ref={divRef} />
    </Grid>
  );
};

export default CareTeam;
