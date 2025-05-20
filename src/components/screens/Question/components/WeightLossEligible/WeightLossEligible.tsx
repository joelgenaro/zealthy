import { useLanguage, usePatient } from '@/components/hooks/data';
import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { useAppointmentActions } from '@/components/hooks/useAppointment';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import { QuestionWithName, Questionnaire } from '@/types/questionnaire';
import { Box, Button } from '@mui/material';
import Router from 'next/router';
import { useCallback } from 'react';
import { useVWO } from '@/context/VWOContext';

interface AddWeighLossCoachingProps {
  onNext: () => void;
  question: QuestionWithName;
  questionnaire: Questionnaire;
}

const WeightLossEligible = ({
  onNext,
  question,
  questionnaire,
}: AddWeighLossCoachingProps) => {
  const vwoContext = useVWO();
  const { data: patientInfo } = usePatient();
  const { addPotentialInsurance } = useIntakeActions();
  const { potentialInsurance } = useIntakeState();
  const { removeAppointment } = useAppointmentActions();
  const { data: patient } = usePatient();
  const language = useLanguage();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const variant7743 = vwoContext.getVariationName('7743', String(patient?.id));
  const isVariant7743 =
    variant7743 === 'Variation-1' &&
    window.location.href.includes('WEIGHT-COACHING-Q1B');
  let router: any;

  const handleContinue = useCallback(
    async (type: string) => {
      if (['NO', 'Yes, but my plan is an HMO', 'YES'].includes(type)) {
        const answer = submitFreeTextAnswer({ text: type });
        await submitAnswer(answer);
      }

      if (
        ['NO', 'Yes, but my plan is an HMO'].includes(type) &&
        patient?.region === 'FL' &&
        ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
          potentialInsurance || ''
        )
      ) {
        const nextQ =
          potentialInsurance === 'Medicare Access Florida'
            ? 'WEIGHT-COACHING-INELIGIBLE-MEDICARE-FLORIDA'
            : 'WEIGHT-COACHING-INELIGIBLE-MEDICAID-FLORIDA';
        language !== 'en'
          ? Router.push(
              `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching-${language}/${nextQ}`
            )
          : Router.push(
              `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching/${nextQ}`
            );

        return;
      }

      if (
        type === 'YES' &&
        patient?.region === 'FL' &&
        ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
          potentialInsurance || ''
        )
      ) {
        language !== 'en'
          ? (router = Router.push(
              `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching-${language}/WEIGHT-COACHING-Q4`
            ))
          : (router = Router.push(
              `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching/WEIGHT-COACHING-Q4`
            ));
        return router;
      }

      if (type === 'YES' && patient?.region === 'FL') {
        language !== 'en'
          ? (router = Router.push(
              `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching-${language}/WEIGHT-COACHING-INELIGIBLE`
            ))
          : (router = Router.push(
              `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching/WEIGHT-COACHING-INELIGIBLE`
            ));
        return router;
      }

      if (type === 'NO') {
        if (
          potentialInsurance !== 'TX' &&
          potentialInsurance !== 'OH' &&
          potentialInsurance !== 'Semaglutide Bundled' &&
          potentialInsurance !== 'Tirzepatide Bundled' &&
          potentialInsurance !== 'Weight Loss Sync' &&
          potentialInsurance !== PotentialInsuranceOption.FIRST_MONTH_FREE
        ) {
          addPotentialInsurance(null);
        }
        removeAppointment('Provider');
        return onNext();
      } else {
        language !== 'en'
          ? Router.push(
              `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching-${language}/WEIGHT-COACHING-INELIGIBLE`
            )
          : Router.push(
              `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching/WEIGHT-COACHING-INELIGIBLE`
            );
      }
    },
    [
      addPotentialInsurance,
      onNext,
      patient?.region,
      potentialInsurance,
      removeAppointment,
      submitAnswer,
      submitFreeTextAnswer,
    ]
  );

  let y = 'Yes';
  let n = 'No';
  let hmo = 'Yes, but my plan is an HMO';

  if (language === 'esp') {
    y = 'Si';
    n = 'No';
    hmo =
      'Sí, pero mi plan es una HMO (Organización de Mantenimiento de Salud).';
  }

  if (isVariant7743) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <>
          <Button
            color="grey"
            onClick={() => {
              onNext();
              return;
            }}
          >
            Yes, I have a private health insurance plan
          </Button>
          <Button color="grey" onClick={() => handleContinue('YES')}>
            Yes, I have government health insurance
          </Button>
          <Button
            color="grey"
            onClick={() => {
              Router.push(
                `${Pathnames.QUESTIONNAIRES}/weight-loss-v2/WEIGHT-LOSS-TREATMENT-B`
              );
              return;
            }}
          >
            I don&apos;t plan to use insurance
          </Button>
        </>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {['Medicare Access Florida', 'Medicaid Access Florida'].includes(
        potentialInsurance || ''
      ) ? (
        <>
          <Button onClick={() => handleContinue('YES')}>Yes</Button>
          <Button color="grey" onClick={() => handleContinue('NO')}>
            {n}
          </Button>
          <Button color="grey" onClick={() => handleContinue(hmo)}>
            {hmo}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => handleContinue('NO')}>No</Button>
          <Button color="grey" onClick={() => handleContinue('YES')}>
            {y}
          </Button>
        </>
      )}
    </Box>
  );
};

export default WeightLossEligible;
