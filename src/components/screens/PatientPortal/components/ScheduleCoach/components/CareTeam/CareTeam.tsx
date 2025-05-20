import { useEffect, useState } from 'react';
import { Box, Grid, Link, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import ProviderSchedule from '../ProviderSchedule';
import { CarePersonType, CoachType } from '@/types/carePersonType';
import { useProviderSchedule } from '@/components/hooks/useProviderSchedule';
import { usePatient } from '@/components/hooks/data';
import HealthCheckupLoading from '@/components/shared/Loading/HealthCheckupLoading';
import { addDays, format } from 'date-fns';

type Appointment = {
  id: number;
  starts_at: string;
  clinician: {
    canvas_practitioner_id: string;
  };
};

const CareTeam = ({ coachType }: { coachType: CoachType }) => {
  const supabase = useSupabaseClient<Database>();
  const { data: patientInfo } = usePatient();
  const [startTime, setStartTime] = useState<string | null>(null);
  const [startLoading, setStartLoading] = useState(true);
  const { loading, practitioners } = useProviderSchedule({
    type: coachType,
    duration: coachType === CarePersonType.MENTAL_HEALTH ? 45 : 15,
    starts_at: startTime || undefined,
  });
  const [showAll, setShowAll] = useState<boolean>(false);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<
    number | null
  >(null);

  const coachMap = {
    'Coach (Mental Health)': 'mental health',
    'Coach (Weight Loss)': 'weight loss',
  };

  const coachRoleMap = {
    'Coach (Mental Health)': 'Mental Health Coach',
    'Coach (Weight Loss)': 'Weight Loss Coach',
  };

  async function fetchRecentCareAppointment() {
    if (!patientInfo?.id) return;
    const recent = await supabase
      .from('appointment')
      .select(`id, starts_at, clinician (canvas_practitioner_id)`)
      .eq('appointment_type', coachType)
      .eq('status', 'Confirmed')
      .eq('patient_id', patientInfo?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => data && (data[0] as Appointment));

    const careTeam = await supabase
      .from('patient_care_team')
      .select('clinician (id)')
      .eq('patient_id', patientInfo?.id)
      .eq('role', coachRoleMap[coachType])
      .limit(1)
      .then(({ data }) => data && (data[0] as { clinician: { id: number } }));
    if (!careTeam) {
      await supabase.from('patient_care_team').insert({
        patient_id: patientInfo?.id,
        role: coachRoleMap[coachType],
      });
    }

    if (careTeam?.clinician?.id) {
      setShowAll(false);
      setSelectedPractitionerId(careTeam?.clinician?.id);
    } else {
      setShowAll(true);
    }

    if (recent?.id) {
      setStartTime(
        coachType == CarePersonType.MENTAL_HEALTH
          ? format(addDays(new Date(recent?.starts_at || ''), 29), 'yyyy-MM-dd')
          : format(addDays(new Date(recent?.starts_at || ''), 13), 'yyyy-MM-dd')
      );
    } else {
      setStartTime(format(new Date(), 'yyyy-MM-dd'));
    }
    setStartLoading(false);
  }

  useEffect(() => {
    if (patientInfo?.id && startTime === null) {
      fetchRecentCareAppointment();
    }
  }, [patientInfo?.id, startTime]);

  return (
    <Grid container direction="column" gap="33px" alignItems="center">
      {loading || startLoading ? (
        <HealthCheckupLoading text="Just a moment - we're finding available appointments." />
      ) : (
        <>
          {!showAll &&
            startTime &&
            practitioners.find(
              p => p.clinician.id === selectedPractitionerId
            ) && (
              <ProviderSchedule
                coachType={coachType}
                key={selectedPractitionerId}
                practitioner={
                  practitioners.find(
                    p => p.clinician.id === selectedPractitionerId
                  )!
                }
              />
            )}

          {showAll &&
            practitioners.map(p => (
              <ProviderSchedule
                coachType={coachType}
                key={p.clinician.id}
                practitioner={p}
              />
            ))}

          {!showAll && (
            <Typography>
              Not fully satisfied with your coach?{' '}
              <Link sx={{ cursor: 'pointer' }} onClick={() => setShowAll(true)}>
                Schedule with a different coach and see if they are a better fit
                for your needs.
              </Link>
            </Typography>
          )}
        </>
      )}
    </Grid>
  );
};

export default CareTeam;
