import { useState } from 'react';
import { Box, Grid, Link, Typography } from '@mui/material';
import Loading from '@/components/shared/Loading/Loading';
import ProviderSchedule from '../ProviderSchedule';
import { useProviderSchedule } from '@/components/hooks/useProviderSchedule';

const CareTeam = ({
  appointmentId,
  startTime,
  selectedPractitionerId,
}: {
  appointmentId?: string | string[] | null;
  startTime: string;
  selectedPractitionerId: number | null;
}) => {
  const { loading, practitioners } = useProviderSchedule({
    type: 'Provider',
    duration: 15,
    starts_at: startTime,
  });
  const [showAll, setShowAll] = useState<boolean>(!selectedPractitionerId);
  return (
    <>
      <Box
        sx={{
          background: '#B8F5CC',
          height: '26px',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'start',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: '1rem',
          width: '150px',
        }}
      >
        <Typography
          component="p"
          variant="body2"
          sx={{ fontSize: '11px !important' }}
        >
          <>
            {!showAll
              ? `Your weight loss provider`
              : 'Zealthy weight loss providers'}
          </>
        </Typography>
      </Box>
      <Grid container direction="column" gap="33px" alignItems="center">
        {loading && <Loading />}
        {!showAll &&
          startTime &&
          selectedPractitionerId &&
          practitioners.find(
            p => p.clinician.id === selectedPractitionerId
          ) && (
            <ProviderSchedule
              key={selectedPractitionerId}
              appointmentId={appointmentId}
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
              key={p.clinician.id}
              appointmentId={appointmentId}
              practitioner={p}
            />
          ))}

        {!showAll && (
          <>
            <Typography>
              Not fully satisfied with your coach?{' '}
              <Link sx={{ cursor: 'pointer' }} onClick={() => setShowAll(true)}>
                Schedule with a different coach and see if they are a better fit
                for your needs.
              </Link>
            </Typography>
          </>
        )}
      </Grid>
    </>
  );
};

export default CareTeam;
