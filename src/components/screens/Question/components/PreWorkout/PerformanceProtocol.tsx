import { Database } from '@/lib/database.types';
import { Stack, Typography } from '@mui/material';
import CheckMark from '@/components/shared/icons/CheckMark';
import { useEffect, useState } from 'react';

type VisitType = Database['public']['Enums']['visit_type'];

const performanceBenefits = [
  'Stronger erections; more endurance',
  'More sexual satisfaction. Go multiple times.',
  'Less muscle fatigue; better pumps',
  'Improved memory, attention, and cognition',
];

const subscriptionBenefits = [
  'Prescription medication tablets (if approved)',
  'Licensed provider reviews',
  'Priority shipping for medication',
];

const PerformanceProtocol = () => {
  const [hasTrackedPreworkout, setHasTrackedPreworkout] =
    useState<boolean>(false);

  useEffect(() => {
    if (!hasTrackedPreworkout) {
      window?.freshpaint?.track('preworkout-start');
      setHasTrackedPreworkout(true);
    }
  }, []);

  return (
    <Stack direction="column" gap="1.5rem">
      <Typography>
        Blood Flow comes in a convenient, orally-disintegrating tablet that
        stimulates your body’s natural blood flow. Perform better in the
        bedroom, office, and the gym with our potent, fast-acting, and
        long-lasting formula.
      </Typography>
      <Typography sx={{ fontWeight: 'bold' }}>Blood flow benefits:</Typography>
      <Stack direction="column" gap="0.5rem">
        {performanceBenefits.map(ben => (
          <>
            <Typography>
              <CheckMark height={14} width={14} strokeWidth={1} />{' '}
              <Typography
                component="span"
                sx={{
                  marginLeft: '10px',
                }}
              >
                {ben}
              </Typography>
            </Typography>
          </>
        ))}
      </Stack>
      <Typography sx={{ fontWeight: 'bold' }}>
        With your subscription, you have access to:
      </Typography>
      <Stack direction="column" gap="0.5rem">
        {subscriptionBenefits.map(ben => (
          <>
            <Typography>
              <CheckMark height={14} width={14} strokeWidth={1} />{' '}
              <Typography
                component="span"
                sx={{
                  marginLeft: '10px',
                }}
              >
                {ben}
              </Typography>
            </Typography>
          </>
        ))}
      </Stack>
    </Stack>
  );
};

export default PerformanceProtocol;
