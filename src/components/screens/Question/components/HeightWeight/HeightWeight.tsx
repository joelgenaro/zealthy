import { useAnswerAction } from '@/components/hooks/useAnswer';
import {
  usePatientActions,
  usePatientState,
} from '@/components/hooks/usePatient';
import { QuestionWithName } from '@/types/questionnaire';
import { calcBmiIndex } from '@/utils/calcBmiIndex';
import {
  Stack,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/router';
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  useAddWeightLog,
  useUpdatePatient,
} from '@/components/hooks/mutations';
import { format } from 'date-fns';
import { useLanguage, usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useVWO } from '@/context/VWOContext';

interface HeightWeightProps {
  question: QuestionWithName;
  onClick: (nextPage?: string) => void;
}

const HeightWeight = ({ question, onClick }: HeightWeightProps) => {
  const vwoClientInstance = useVWO();
  const [loading, setLoading] = useState(false);
  const { addHeightFt, addHeightIn, addWeight, addBMI } = usePatientActions();
  const { height_ft, height_in, weight } = usePatientState();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const addWeightLog = useAddWeightLog();
  const updatePatient = useUpdatePatient();
  const { pathname, query } = useRouter();
  const { data: patient } = usePatient();
  const { specificCare } = useIntakeState();
  const language = useLanguage();

  let heightLabel = 'Height';
  let weightText = 'Weight';
  let continueText = 'Continue';
  let lbs = 'lbs';
  let ft = 'ft';
  let inches = 'in';
  let errorMsg = 'Max weight is';

  const [isOverMax, setIsOverMax] = useState(false);
  const [storedValuesPresent, setStoredValuesPresent] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);

  const [visible, setVisible] = useState(false);

  let variationName: string | null | undefined = null;

  const activateABTest = async () => {
    if (patient?.id && vwoClientInstance) {
      variationName = await vwoClientInstance.activate('3454', patient);
    }
  };

  useEffect(() => {
    activateABTest();
    if (patient) {
      console.log('Patient: ', patient);
    }
  }, [vwoClientInstance, patient?.id]);

  const isPreCheckout = useMemo(
    () => !pathname.includes('post-checkout'),
    [pathname]
  );

  const isWeightLoss = useMemo(() => {
    return question.questionnaire.toLowerCase().includes('weight-loss');
  }, [question.questionnaire]);

  const handleFeet: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      if (value && Number(value) < 1) return;
      const heightFtValue = value ? Number(value) : null;
      addHeightFt(heightFtValue);
      sessionStorage.setItem('patientHeightFt', JSON.stringify(heightFtValue));
    },
    [addHeightFt]
  );

  const handleInch: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      if (value && Number(value) < 0) return;
      const heightInValue = value ? Number(value) : null;
      addHeightIn(heightInValue);
      sessionStorage.setItem('patientHeightIn', JSON.stringify(heightInValue));
    },
    [addHeightIn]
  );

  const handleLbs: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      if (value && Number(value) < 1) return;
      const weightValue = value ? Number(value) : null;
      addWeight(weightValue);
      sessionStorage.setItem('patientWeight', JSON.stringify(weightValue));
    },
    [addWeight]
  );

  // Read session storage and set patient values for weight-loss-ro flow
  useEffect(() => {
    const storedWeight = sessionStorage.getItem('patientWeight');
    const storedHeightFt = sessionStorage.getItem('patientHeightFt');
    const storedHeightIn = sessionStorage.getItem('patientHeightIn');

    if (storedWeight && storedHeightFt && storedHeightIn) {
      const weightValue = JSON.parse(storedWeight);
      const heightFtValue = JSON.parse(storedHeightFt);
      const heightInValue = JSON.parse(storedHeightIn);
      addWeight(weightValue);
      addHeightFt(heightFtValue);
      addHeightIn(heightInValue);
      setStoredValuesPresent(true);
    } else {
      console.log('No stored values found');
    }
    setIsInitialized(true);
  }, [addWeight, addHeightFt, addHeightIn]);

  useEffect(() => {
    if (
      storedValuesPresent &&
      weight !== null &&
      height_ft !== null &&
      height_in !== null &&
      sessionStorage.getItem('weight-loss-flow') === 'ro'
    ) {
      setAutoSubmitting(true);
      onSubmit(new Event('submit') as any);
    }
  }, [storedValuesPresent, weight, height_ft, height_in]);

  useEffect(() => {
    if (isInitialized && !autoSubmitting) {
      setVisible(true);
    }
  }, [isInitialized, autoSubmitting]);

  const onSuccess = useCallback(
    (bmiScore: number) => {
      addBMI(bmiScore);
      if (!isWeightLoss) {
        onClick(question.next);
        return;
      }
      if (variationName === 'bmi_cutoff_30') {
        if (bmiScore < 30) {
          onClick('DISQUALIFY_BMI');
        } else {
          onClick(question.next);
        }
        return;
      }
      if (bmiScore < 25 && isPreCheckout) {
        onClick('DISQUALIFY_BMI');
      } else if (
        bmiScore < 25 &&
        specificCare === SpecificCareOption.WEIGHT_LOSS_ACCESS_V2
      ) {
        onClick('DISQUALIFY_BMI_2');
      } else {
        onClick(question.next);
      }
    },
    [
      addBMI,
      isPreCheckout,
      isWeightLoss,
      onClick,
      question.next,
      specificCare,
      variationName,
    ]
  );

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();
      if (isOverMax && isWeightLoss) return;
      setLoading(true);
      const height = height_ft! * 12 + height_in!;
      const bmiScore = calcBmiIndex(height, weight!);
      submitFreeTextAnswer({
        text: `Height: ${height_ft}'${height_in}, Weight: ${weight}, BMI: ${bmiScore}`,
      });
      if (patient?.id) {
        await Promise.all([
          addWeightLog.mutateAsync({
            weight: weight!,
            patient_id: patient?.id,
            date_logged: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
          }),
          updatePatient.mutateAsync({ height, weight }),
        ])
          .then(() => onSuccess(bmiScore))
          .catch(error => {
            console.error('Error during submission:', error);
            setLoading(false);
          });
      } else {
        if (pathname.includes('weight-loss-ro')) {
          sessionStorage.setItem('weight-loss-flow', 'ro');
          sessionStorage.setItem('patientHeight', JSON.stringify(height));
          sessionStorage.setItem('patientWeight', JSON.stringify(weight));
          sessionStorage.setItem('patientBMI', JSON.stringify(bmiScore));
          sessionStorage.setItem('patientHeightFt', JSON.stringify(height_ft));
          sessionStorage.setItem('patientHeightIn', JSON.stringify(height_in));
        }
        onSuccess(bmiScore);
      }
    },
    [
      isOverMax,
      isWeightLoss,
      height_ft,
      height_in,
      weight,
      submitFreeTextAnswer,
      addWeightLog,
      patient?.id,
      updatePatient,
      onSuccess,
      pathname,
    ]
  );

  useEffect(() => {
    if (weight) {
      if (weight >= 500 && isWeightLoss) {
        setIsOverMax(true);
      } else if (isOverMax && weight < 500) {
        setIsOverMax(false);
      }
    }
  }, [isOverMax, isWeightLoss, weight]);

  if (language === 'esp') {
    errorMsg = 'El peso máximo';
    lbs = 'libras';
    heightLabel = 'Altura';
    weightText = 'Peso';
    continueText = 'Continuar';
    ft = 'pies';
    inches = 'Pulgadas';
  }

  // If we're auto-submitting, show a spinner.
  if (autoSubmitting) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <Stack component="form" onSubmit={onSubmit} direction="column" gap="48px">
        <Typography variant="h2">
          {query.variant === '4438'
            ? 'Tell us your current height and weight.'
            : language === 'esp'
            ? '¿Cuál es tu altura y peso actualmente?'
            : 'What’s your current height and weight?'}
        </Typography>
        <Box display="flex" flexDirection="column" gap="10px">
          <Typography variant="h3">{heightLabel}</Typography>
          <Stack direction="row" gap="16px">
            <TextField
              name="feet"
              required
              type="number"
              fullWidth
              placeholder={ft}
              value={height_ft ?? ''}
              onChange={handleFeet}
            />
            <TextField
              required
              name="inch"
              type="number"
              fullWidth
              placeholder={inches}
              value={height_in ?? ''}
              onChange={handleInch}
            />
          </Stack>
        </Box>
        <Box display="flex" flexDirection="column" gap="10px">
          <Typography variant="h3">{weightText}</Typography>
          <TextField
            name="pound"
            required
            type="number"
            fullWidth
            placeholder={lbs}
            value={weight ?? ''}
            onChange={handleLbs}
          />
        </Box>
        <Stack gap="10px">
          {isOverMax && (
            <ErrorMessage>
              {errorMsg} 499 {lbs}
            </ErrorMessage>
          )}
          <LoadingButton
            loading={loading}
            disabled={loading || isOverMax || !weight}
            type="submit"
          >
            {continueText}
          </LoadingButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default HeightWeight;
