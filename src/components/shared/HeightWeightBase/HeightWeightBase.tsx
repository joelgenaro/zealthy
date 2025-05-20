import { usePatient } from '@/components/hooks/data';
import {
  useAddWeightLog,
  useUpdatePatient,
} from '@/components/hooks/mutations';
import {
  usePatientActions,
  usePatientState,
} from '@/components/hooks/usePatient';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/system/Stack';
import { format } from 'date-fns';
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import LoadingButton from '../Button/LoadingButton';
import ErrorMessage from '../ErrorMessage';

interface HeightWeightBaseProps {
  onSuccess: ({
    height_ft,
    height_in,
    weight,
  }: {
    height_ft: number;
    height_in: number;
    weight: number;
  }) => Promise<void>;
  maxWeight: number;
}

const HeightWeightBase = ({ onSuccess, maxWeight }: HeightWeightBaseProps) => {
  const [loading, setLoading] = useState(false);
  const { addHeightFt, addHeightIn, addWeight, addBMI } = usePatientActions();
  const { height_ft, height_in, weight } = usePatientState();
  const addWeightLog = useAddWeightLog();
  const updatePatient = useUpdatePatient();
  const { data: patient } = usePatient();

  const [isOverMax, setIsOverMax] = useState(false);

  const handleFeet: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      if (value && Number(value) < 1) {
        return;
      }
      addHeightFt(value ? Number(value) : null);
    },
    [addHeightFt]
  );

  const handleInch: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      if (value && Number(value) < 0) {
        return;
      }
      addHeightIn(value ? Number(value) : null);
    },
    [addHeightIn]
  );

  const handleLbs: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      if (value && Number(value) < 1) {
        return;
      }
      addWeight(value ? Number(value) : null);
    },
    [addWeight]
  );

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();

      try {
        setLoading(true);

        await Promise.all([
          // add patient weight log to DB
          addWeightLog.mutateAsync({
            weight: weight!,
            patient_id: patient?.id,
            date_logged: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
          }),

          // add patient height to DB
          updatePatient.mutateAsync({
            height: height_ft! * 12 + height_in!,
            weight,
          }),
        ]);

        await onSuccess({
          height_ft: height_ft!,
          height_in: height_in!,
          weight: weight!,
        });
      } catch (err) {
        setLoading(false);
      }
    },
    [
      height_ft,
      height_in,
      weight,
      addWeightLog,
      patient?.id,
      updatePatient,
      onSuccess,
    ]
  );

  useEffect(() => {
    if (weight) {
      if (weight >= maxWeight) setIsOverMax(true);
      else if (isOverMax && weight < 500) setIsOverMax(false);
    }
  }, [isOverMax, maxWeight, weight]);

  return (
    <Stack component="form" onSubmit={onSubmit} direction="column" gap="48px">
      <Typography variant="h2">
        What’s your current height and weight?
      </Typography>
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
        {isOverMax && <ErrorMessage>Max weight is 499 lbs</ErrorMessage>}
        <LoadingButton
          loading={loading}
          disabled={loading || isOverMax || !weight}
          type="submit"
        >
          {'Continue'}
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default HeightWeightBase;
