import { Container, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import CareTeam from './components/CareTeam';
import { usePatient } from '@/components/hooks/data';
import { useAnswerActions } from '@/components/hooks/useAnswer';
import { addHours, format } from 'date-fns';

interface ApptProps {
  starts_at: string;
  clinician: {
    id: number;
  };
}
const SchedulePsychiatry = () => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const [startTime, setStartTime] = useState<string | null>(null);
  const { clearAnswers } = useAnswerActions();
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<
    number | null
  >(null);

  async function fetchLastPsychiatryAppointment() {
    if (!patient?.id) return;
    const lastAppointment = await supabase
      .from('appointment')
      .select('starts_at, clinician (id)')
      .eq('patient_id', patient?.id)
      .eq('appointment_type', 'Provider')
      .or('status.eq.Completed,status.eq.Confirmed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data as ApptProps);

    setSelectedPractitionerId(lastAppointment?.clinician?.id);
    setStartTime(format(addHours(new Date(), 3), 'yyyy-MM-dd'));
  }

  const completeVisit = async () => {
    let visit_id;

    if (patient?.id && patient?.canvas_patient_id) {
      const { data } = await supabase
        .from('online_visit')
        .select('id')
        .eq('patient_id', patient?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        visit_id = data.id;
      }
    }

    if (patient?.id && visit_id) {
      await supabase
        .from('online_visit')
        .update({
          status: 'Completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', visit_id);
    }
    clearAnswers();
  };

  useEffect(() => {
    if (patient?.id) {
      completeVisit();
      fetchLastPsychiatryAppointment();
    }
  }, [patient?.id]);

  return (
    <Container maxWidth="lg">
      <Grid container direction="column">
        <Typography variant="h2" mb="4rem">
          Please schedule your remote visit.
        </Typography>
        {startTime && (
          <CareTeam
            startTime={startTime}
            selectedPractitionerId={selectedPractitionerId}
          />
        )}
      </Grid>
    </Container>
  );
};

export default SchedulePsychiatry;
