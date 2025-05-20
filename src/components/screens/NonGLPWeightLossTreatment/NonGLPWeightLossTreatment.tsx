import Router from 'next/router';
import { useCallback, useState } from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';
import { details, medications, medicationsCA } from './data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useSearchParams } from 'next/navigation';
import { Pathnames } from '@/types/pathnames';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { usePatient } from '@/components/hooks/data';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import Medication from './components/Medication';
import { Database } from '@/lib/database.types';

const isAvailable = (
  clinicFavorites: Database['public']['Tables']['clinic_favorites']['Row'][],
  medications: string[]
) => {
  return medications.every(m => {
    return clinicFavorites.some(
      f => f.Title?.toLowerCase().includes(m) && f.active
    );
  });
};

type MedProps = {
  brand: string;
  drug: string;
  body1: string;
  body2: string;
};

const NonGLPWeightLossTreatment = () => {
  const { addMedication } = useVisitActions();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const { data: patient } = usePatient();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );

  const medicationOptions = ['WI']?.includes(patient?.region || '')
    ? medicationsCA
    : medications;

  const handleConfirmMed = useCallback(async () => {
    setLoading(true);

    await createVisitAndNavigateAway([SpecificCareOption.OTHER], {
      navigateAway: false,
    });

    if (medicationSelected) {
      addMedication({
        type: MedicationType.WEIGHT_LOSS,
        medication_quantity_id: medicationSelected
          .toLowerCase()
          .includes('metformin')
          ? 125
          : 318,
        name: medicationSelected,
        recurring: {
          interval: 'months', //months
          interval_count: 1, //how often
        },
      });
    }
    Router.push(`${Pathnames.NON_GLP1_MEDICATIONS}/non-glp1-meds-request`);

    setLoading(false);
  }, [addMedication, createVisitAndNavigateAway, medicationSelected]);

  function selectMedication(med: MedProps) {
    Router.push(
      {
        pathname: `/patient-portal/weight-loss-treatment/non-glp`,
        query: { med: med.brand },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
  }

  return (
    <Container maxWidth="xs">
      {medicationSelected && !review && !quantity && (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {details[medicationSelected].title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '3rem',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                marginBottom: '0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1rem !important',
                  flexBasis: '25%',
                }}
              >
                {'Overview'}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#777777',
                  flexBasis: '75%',
                }}
              >
                {details[medicationSelected].overview}
              </Typography>
            </Box>
            <Divider sx={{ marginBottom: '0.5rem' }} />
            <Box
              sx={{
                display: 'flex',
                marginBottom: '0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1rem !important',
                  flexBasis: '25%',
                }}
              >
                {'Results'}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#777777',
                  flexBasis: '75%',
                }}
              >
                {details[medicationSelected].results}
              </Typography>
            </Box>
            <Divider sx={{ marginBottom: '0.5rem' }} />
            <Box
              sx={{
                display: 'flex',
                marginBottom: '0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1rem !important',
                  flexBasis: '25%',
                }}
              >
                {'Cost'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexBasis: '75%',
                }}
              >
                {details[medicationSelected].cost && (
                  <Typography
                    key={`cost`}
                    sx={{
                      fontSize: '0.875rem ',
                      color: '#777777',
                      flexBasis: '75%',
                      marginBottom: '1rem',
                    }}
                  >
                    {details[medicationSelected].cost}
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ marginBottom: '0.5rem' }} />
          </Box>
          <LoadingButton
            type="button"
            loading={loading}
            disabled={loading}
            fullWidth
            sx={{ marginBottom: '1rem', fontSize: '14px' }}
            onClick={handleConfirmMed}
          >
            Select as preferred medication and continue
          </LoadingButton>
        </>
      )}
      {!medicationSelected && !review && (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {'Confirm your preferred treatment option.'}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {`While you should share your preferred treatment option, 
            your provider will ultimately only move forward with a treatment 
            option that is medically appropriate for you. Both of these medication 
            options will be included in the price of your membership at no additional 
            cost to you and will be shipped to your door.`}
          </Typography>

          <Box sx={{ marginBottom: '3rem' }}>
            {medicationOptions.map((med, i) => (
              <Medication
                medication={med}
                key={i}
                onSelect={selectMedication}
              />
            ))}
          </Box>
        </>
      )}
    </Container>
  );
};

export default NonGLPWeightLossTreatment;
