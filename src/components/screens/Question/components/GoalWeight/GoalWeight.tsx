import { useAnswerAction } from '@/components/hooks/useAnswer';
import {
  usePatientActions,
  usePatientState,
} from '@/components/hooks/usePatient';
import { QuestionWithName } from '@/types/questionnaire';
import { calcBmiIndex } from '@/utils/calcBmiIndex';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useMemo,
} from 'react';
import { useAddWeightLog } from '@/components/hooks/mutations';
import { format } from 'date-fns';
import { usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

interface HeightWeightProps {
  question: QuestionWithName;
  onClick: (nextPage?: string) => void;
}

const HeightWeight = ({ question, onClick }: HeightWeightProps) => {
  const { addHeightFt, addHeightIn, addWeight, addBMI } = usePatientActions();
  const { height_ft, height_in, weight } = usePatientState();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const addWeightLog = useAddWeightLog();
  const { pathname } = useRouter();
  const { data: patient } = usePatient();
  const { specificCare } = useIntakeState();

  const isPreCheckout = useMemo(
    () => !pathname.includes('post-checkout'),
    [pathname]
  );

  const handleFeet: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      addHeightFt(value ? Number(value) : null);
    },
    [addHeightFt]
  );

  const handleInch: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      addHeightIn(value ? Number(value) : null);
    },
    [addHeightIn]
  );

  const handleLbs: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      if (value && Number(value) > 1500) {
        return;
      }
      addWeight(value ? Number(value) : null);
    },
    [addWeight]
  );

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();
      const height = height_ft! * 12 + height_in!;
      const bmiScore = calcBmiIndex(height, weight!);

      submitFreeTextAnswer({
        text: `Height: ${height_ft}'${height_in}", Weight: ${weight}, BMI: ${bmiScore}`,
      });

      addBMI(bmiScore);

      if (bmiScore < 27 && isPreCheckout) {
        onClick('DISQUALIFY_BMI');
      } else if (
        bmiScore < 27 &&
        specificCare === SpecificCareOption.WEIGHT_LOSS_ACCESS_V2
      ) {
        onClick('DISQUALIFY_BMI_2');
      } else {
        onClick(question.next);
      }

      const date_logged = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");

      addWeightLog.mutateAsync({
        weight: weight!,
        patient_id: patient?.id,
        date_logged,
      });
    },
    [
      addBMI,
      addWeightLog,
      height_ft,
      height_in,
      isPreCheckout,
      onClick,
      patient?.id,
      question.next,
      submitFreeTextAnswer,
      weight,
    ]
  );

  return (
    <Stack component="form" onSubmit={onSubmit} direction="column" gap="48px">
      <Box display="flex" flexDirection="column" gap="10px">
        <Typography variant="h3">Height</Typography>
        <Stack direction="row" gap="16px">
          <TextField
            name="feet"
            required
            type="number"
            fullWidth
            placeholder="ft"
            value={height_ft ?? ''}
            onChange={handleFeet}
          />
          <TextField
            required
            name="inch"
            type="number"
            fullWidth
            placeholder="in"
            value={height_in ?? ''}
            onChange={handleInch}
          />
        </Stack>
      </Box>
      <Box display="flex" flexDirection="column" gap="10px">
        <Typography variant="h3">Weight</Typography>
        <TextField
          name="pound"
          required
          type="number"
          fullWidth
          placeholder="lbs"
          value={weight ?? ''}
          onChange={handleLbs}
        />
      </Box>
      <Stack gap="10px">
        <Button type="submit">{'Continue'}</Button>
      </Stack>
    </Stack>
  );
};

export default HeightWeight;
