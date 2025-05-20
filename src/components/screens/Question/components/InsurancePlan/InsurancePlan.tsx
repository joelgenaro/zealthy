import { useIsMobile } from '@/components/hooks/useIsMobile';
import { QuestionWithName } from '@/types/questionnaire';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  useLanguage,
  usePatient,
  useVWOVariationName,
} from '@/components/hooks/data';
import Router from 'next/router';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { usePatientActions } from '@/components/hooks/usePatient';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  insuranceOptionV2,
  insuranceOptions,
} from './components/insurance-options';
import InsurancePlanCard from './components/InsurancePlanCard';
import InsurancePlanCardV2 from './components/InsurancePlanCardV2';
import { useEffect } from 'react';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';

interface ComponentProps {
  nextPage: (nextPage?: string) => void;
  question: QuestionWithName;
}

const InsurancePlan = ({ nextPage, question }: ComponentProps) => {
  const supabase = useSupabaseClient();
  const isMobile = useIsMobile();
  const { addVariant, addPotentialInsurance } = useIntakeActions();
  const { updateVisit } = useVisitActions();
  const { potentialInsurance } = useIntakeState();
  const { updatePatient } = usePatientActions();
  const { data: patient } = usePatient();
  const { data: variation6792 } = useVWOVariationName('6792');
  const language = useLanguage();

  useEffect(() => {
    if (
      potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED ||
      potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED
    ) {
      addPotentialInsurance(null);
      updateVisit({
        questionnaires: [
          {
            name: ['Variation-1'].includes(variation6792?.variation_name || '')
              ? 'weight-loss'
              : language === 'esp'
              ? 'weight-loss-esp'
              : 'weight-loss-v2',
            care: 'weight loss',
            entry: 'WEIGHT_L_Q3',
            intro: false,
          },
          ...(['Variation-1'].includes(variation6792?.variation_name || '')
            ? [
                {
                  name: 'weight-loss-coaching',
                  care: 'weight loss',
                  entry: 'WEIGHT-COACHING-Q1A',
                  intro: false,
                },
              ]
            : []),
        ],
      });
    }
  }, [potentialInsurance]);

  const handleContinue = (index: number) => {
    index === 1
      ? ['Variation-1', 'Variation-2']?.includes(
          variation6792?.variation_name || ''
        )
        ? handleNext()
        : onSuccessVar2Choice1()
      : ['Variation-1', 'Variation-2']?.includes(
          variation6792?.variation_name || ''
        )
      ? nextPage('BUNDLED_PREFERENCE')
      : onSuccessVar2Choice2();
  };

  const handleNext = () => {
    // addPotentialInsurance(null);
    nextPage('WEIGHT_L_Q3');
  };

  function updateHasInsurance() {
    updatePatient({
      insurance_skip: true,
    });
  }

  const onSuccessVar2Choice1 = async () => {
    addVariant('0');
    await supabase
      .from('patient')
      .update({ insurance_skip: false })
      .eq('id', patient?.id)
      .then(updateHasInsurance);
    nextPage('WEIGHT_L_Q3');
  };

  ///
  const onSuccessVar2Choice2 = async () => {
    addVariant('4935Var2NI');
    await supabase
      .from('patient')
      .update({ insurance_skip: true })
      .eq('id', patient?.id)
      .then(updateHasInsurance);
    language !== 'en'
      ? Router.push(
          `/questionnaires-v2/weight-loss-coaching-${language}/WEIGHT-COACHING-Q2`
        )
      : Router.push(
          '/questionnaires-v2/weight-loss-coaching/WEIGHT-COACHING-Q2'
        );
  };

  return (
    <Stack
      gap={4}
      width={isMobile ? '100%' : '185%'}
      display="flex"
      flexDirection={'column'}
      //   alignItems="center"
      sx={{
        position: isMobile ? '' : 'relative',
        right: isMobile ? 0 : 200,
      }}
    >
      <Typography variant="h2" alignSelf="center">
        {question?.header}
      </Typography>
      {!['Variation-1', 'Variation-2']?.includes(
        variation6792?.variation_name || ''
      ) ? (
        <Typography textAlign="center">
          {
            'Many of our members choose Affordable GLP-1, since they can receive GLP-1 monthly or every 3 months. On average people lose 8% of their weight in their first 3 months on Tirzepatide (same active ingredient as Mounjaro & Zepbound).* On average people lose 6.9% of their weight in their first 3 months on Semaglutide (same active ingredient as Ozempic & Wegovy).**'
          }
        </Typography>
      ) : (
        <Box
          padding="32px"
          width={isMobile ? '100%' : '600px'}
          sx={{
            gap: '1rem',
            borderLeft: '5px solid #00531B',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'center',
            boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Typography fontWeight={600} fontSize="1.2rem!important">
            With either option you can expect to lose:
          </Typography>
          <Box display="flex" sx={{ gap: '1rem' }}>
            <Typography fontSize="2.1rem!important" sx={{ color: '#00872B' }}>
              7-8%
            </Typography>
            <Typography>every 3 months*</Typography>
          </Box>
        </Box>
      )}
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        sx={{
          gap: '3rem',
        }}
      >
        {['Variation-1', 'Variation-2']?.includes(
          variation6792?.variation_name || ''
        )
          ? insuranceOptionV2.map((option, idx) => (
              <InsurancePlanCardV2
                key={idx}
                option={option}
                handleContinue={handleContinue}
                optionIndex={idx}
              />
            ))
          : insuranceOptions.map(option => (
              <InsurancePlanCard
                key={option.index}
                option={option}
                handleContinue={handleContinue}
              />
            ))}
      </Box>
      {!['Variation-1', 'Variation-2']?.includes(
        variation6792?.variation_name || ''
      ) ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontStyle="italic">
            *This is based on data from a 2022 study published in the New
            England Journal of Medicine titled “Tirzepatide Once Weekly for the
            Treatment of Obesity.”
          </Typography>
          <Typography variant="h4" fontStyle="italic">
            **This is based on data from a 2022 study published in the American
            Medical Association titled “Weight Loss Outcomes Associated With
            Semaglutide Treatment for Patients with Overweight or Obesity.”
          </Typography>
        </Box>
      ) : (
        <Typography
          variant="h4"
          fontStyle="italic"
          sx={{ textAlign: 'center' }}
        >
          *This is based on data from a 2022 study published in the New England
          Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment
          of Obesity” and a 2022 study published the American Medical
          Association titled &quot;Weight Loss Outcomes Associated With
          Semaglutide Treatment for Patients With Overweight or Obesity.&quot;
        </Typography>
      )}
    </Stack>
  );
};

export default InsurancePlan;
