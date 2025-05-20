import ArrowRight from '@/components/shared/icons/ArrowRight';
import {
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { format, getYear } from 'date-fns';
import Spinner from '@/components/shared/Loading/Spinner';

const FitnessNutritionPlan = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState<
    { title: string; subtitle: string; url: string }[] | []
  >([]);

  async function handleGrabPdfs() {
    const currentMonth = format(new Date(), 'MMMM').toLowerCase();
    const currentYear = getYear(new Date());

    setData([
      {
        title: 'Fitness Plan',
        subtitle: `Your monthly fitness plan will help you achieve lasting weight loss.`,
        url: `https://${
          process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
            ? 'gcqrvlegvyiunwewkuoz'
            : 'ordynhmcwwnczgnvuomz'
        }.supabase.co/storage/v1/object/public/pdfs/${currentYear}/${currentMonth}/Zealthy%20Fitness%20Plan.pdf`,
      },
      {
        title: 'Nutrition Plan',
        subtitle: `Your personalized monthly nutrition guide to help you lose weight.`,
        url: `https://${
          process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
            ? 'gcqrvlegvyiunwewkuoz'
            : 'ordynhmcwwnczgnvuomz'
        }.supabase.co/storage/v1/object/public/pdfs/${currentYear}/${currentMonth}/Zealthy%20Diet%20&%20Nutrition%20Plan.pdf`,
      },
      {
        title: 'Meal Planner',
        subtitle: `Plan healthy meals & share with your Zealthy weight loss coach.`,
        url: `https://${
          process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
            ? 'gcqrvlegvyiunwewkuoz'
            : 'ordynhmcwwnczgnvuomz'
        }.supabase.co/storage/v1/object/public/pdfs/${currentYear}/${currentMonth}/Zealthy%20Meal%20Tracker.pdf`,
      },
      {
        title: 'Habit Tracker',
        subtitle: `Track your behaviors and habits to support your weight loss journey.`,
        url: `https://${
          process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
            ? 'gcqrvlegvyiunwewkuoz'
            : 'ordynhmcwwnczgnvuomz'
        }.supabase.co/storage/v1/object/public/pdfs/${currentYear}/${currentMonth}/Zealthy%20Habit%20Tracker.pdf`,
      },
    ]);
  }

  useEffect(() => {
    handleGrabPdfs();
  }, []);
  const handleOnClick = (url: string) => {
    window.open(url);
  };
  return (
    <Container maxWidth="sm">
      {!data.length ? (
        <Spinner />
      ) : (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {'Fitness & Nutrition '}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
            {
              'Use these personalized guides and worksheets to support your weight loss plan. You can share back your work here with your Zealthy weight loss coach also.'
            }
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.88rem',
            }}
          >
            {data.map(({ title, subtitle, url }) => (
              <Box
                key={title}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexBasis: `calc(${isMobile ? '100%' : '50%'} - 2rem)`,
                  borderRadius: '1rem',
                  padding: '1rem',
                  border: '1px solid #D8D8D8',
                  background: '#FFF',
                  boxShadow: '2px 4px 9px 0px rgba(0, 0, 0, 0.25)',
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => handleOnClick(url)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography variant="body1">{subtitle}</Typography>
                </Box>
                <Box sx={{ textAlign: 'end' }}>
                  <ArrowRight />
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Container>
  );
};

export default FitnessNutritionPlan;
