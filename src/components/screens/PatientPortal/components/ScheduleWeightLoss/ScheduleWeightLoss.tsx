import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import CareTeam from './components/CareTeam';
import { usePatient } from '@/components/hooks/data';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { addHours, format } from 'date-fns';

interface ProviderProps {
  clinician: {
    id: number;
  };
}
const ScheduleWeightLoss = () => {
  const supabase = useSupabaseClient<Database>();
  const { id } = Router.query;
  const { data: patient } = usePatient();
  const [startTime, setStartTime] = useState<string | null>(null);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<
    number | null
  >(null);
  const [isActiveRequest, setIsActiveRequest] = useState<boolean>(true);

  async function fetchWeightLossProvider() {
    if (!patient?.id || !id) {
      return;
    }
    const providerId = await supabase
      .from('prescription_request')
      .select('clinician (id)')
      .eq('patient_id', patient?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data as ProviderProps);
    const appt = await supabase
      .from('appointment')
      .select()
      .eq('id', id)
      .single()
      .then(({ data }) => data);

    setIsActiveRequest(appt?.status === 'ProviderRequested');
    setSelectedPractitionerId(providerId?.clinician?.id);
    setStartTime(format(addHours(new Date(), 3), 'yyyy-MM-dd'));
  }

  useEffect(() => {
    if (patient?.id) {
      fetchWeightLossProvider();
    }
  }, [patient?.id]);

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        {isActiveRequest ? (
          <>
            <Typography variant="h2">
              <>{'Please schedule your remote visit.'}</>
            </Typography>
            {startTime && (
              <CareTeam
                appointmentId={id}
                startTime={startTime}
                selectedPractitionerId={selectedPractitionerId}
              />
            )}
          </>
        ) : (
          <>
            <Box
              sx={{
                maxWidth: '400px',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '48px',
              }}
            >
              <Typography variant="h2">
                {'This appointment is not available for scheduling.'}
              </Typography>
              <Button
                fullWidth
                onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
              >
                Go back
              </Button>
            </Box>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default ScheduleWeightLoss;
