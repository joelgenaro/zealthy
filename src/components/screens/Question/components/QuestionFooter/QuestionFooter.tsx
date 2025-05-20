import { useAnswerAction } from '@/components/hooks/useAnswer';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { QuestionWithName } from '@/types/questionnaire';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Url } from 'next/dist/shared/lib/router/router';
import Router from 'next/router';
import { useCallback } from 'react';
import { useLanguage, usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useVWOVariationName } from '@/components/hooks/data';

interface QuestionFooterProps {
  question: QuestionWithName;
  error?: string;
  onClick: (nextPage?: string) => void;
  nextPage: (nextPage?: string) => void; //by passing answer verification
}

const QuestionFooter = ({
  question,
  error,
  onClick,
  nextPage,
}: QuestionFooterProps) => {
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const handleClick = useCallback(() => onClick(), [onClick]);
  const handleSkip = useCallback(() => {
    submitFreeTextAnswer({
      text: 'Skipped',
    });
    nextPage();
  }, [nextPage, submitFreeTextAnswer]);

  const { potentialInsurance, specificCare, variant } = useIntakeState();
  const patient = usePatient();
  const patientId = patient?.data?.id;
  const language = useLanguage();

  if (question.hideFooter) return null;

  if (
    [
      'add-mental-coaching',
      'add-weight-coaching',
      'add-weight-coaching-access',
      'weight-loss-eligibility',
      'weight-loss-ineligible',
      'weight-coaching-agreement',
      'weight-government-insurance',
      'suicide-alarm',
      'ed-treatment-select',
      'height-weight',
      'goal-weight',
      'weight',
      'blood-pressure',
      'alarm',
      'mental-health-schedule',
      'mental-health-addon-payment',
      'hair-loss-photo',
      'photo-face',
      'select-visit-type',
      'analyze-weight-loss-results',
      'ilv-start',
      'ilv-end',
      'non-glp1-final',
      'submit-non-glp1-meds-request',
      'birth-control-treatment-select-v2',
      'menopause-treatment-select',
      'choice',
      'disqualify',
      'ssn-verification',
      'crosscheck-verification',
      'enclomiphene-treatment-select',
      'at-home-lab',
      'async-mental-health-dosages',
      'ed-usage-select',
      'ed-treatment-select-v2',
      'female-hair-loss-select',
      'ed-hl-select',
      'female-hair-loss-treatment-select',
      'lab-or-blood-tests',
      'weight-goal',
      'pricing-options',
      'weight-loss-preference',
      'weight-loss-pay',
      'weight-loss-treatment',
      'insurance-plan',
      'bundled-choice',
      'insurance-information',
      'pharmacy-select',
    ].includes(question.type)
  ) {
    return null;
  }
  let continueButtonText = 'Continue';
  let skip = 'Skip';
  if (language === 'esp') {
    continueButtonText = 'Continuar';
    skip = 'omitir';
  }

  return (
    <Stack gap="25px">
      <Stack gap="16px" alignItems="center">
        {(question.name === 'WEIGHT_L_POST_Q20' &&
          question?.answerOptions?.length === 1) ||
        question.name === 'PREP_Q1' ? null : (
          <>
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            {question.name === 'WEIGHT_L_C_REFILL_Q3' ||
            question.name === 'WEIGHT_L_Q8' ? null : (
              <Button
                fullWidth
                sx={{
                  ...(question.styles || {}).button,
                }}
                onClick={
                  question.path
                    ? () => Router.push(question.path as Url)
                    : handleClick
                }
              >
                {question.buttonText || continueButtonText}
              </Button>
            )}
            {question.allowToSkip ? (
              <Button
                fullWidth
                color="grey"
                onClick={handleSkip}
                sx={{
                  ...(question.styles || {}).button,
                }}
              >
                {skip}
              </Button>
            ) : null}
          </>
        )}
      </Stack>
      {question.footer ? (
        <Stack direction="column" alignItems="center" gap="10px">
          {question.name === 'WEIGHT-COACHING-Q2' ? (
            <Typography
              variant="subtitle1"
              color="#747474"
              style={{ fontSize: '12px' }}
            >
              {question.header.includes('tirzepatide')
                ? '* People using Mounjaro® and Zepbound™, medications with the active ingredient tirzepatide, lost 20% of their body weight on average in clinical studies.'
                : question.footer.description}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '14px !important' }}>
              {question.footer.description}
            </Typography>
          )}
          <Typography
            textAlign="center"
            fontWeight="300"
            sx={{ fontSize: '13px !important' }}
          >
            {question.footer.detail}
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default QuestionFooter;
