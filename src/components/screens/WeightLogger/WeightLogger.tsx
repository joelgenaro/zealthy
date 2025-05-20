import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  Modal,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  addDays,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
  isBefore,
  isSameDay,
} from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Router from 'next/router';
import { ArrowLeft, ArrowRight, Close } from '@mui/icons-material';
import { useAddWeightLog } from '@/components/hooks/mutations';
import { usePatient, usePatientWeightLogs } from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import HighFive from '@/components/shared/icons/HighFive';
import LoadingButton from '@/components/shared/Button/LoadingButton';

const WeightLogger = () => {
  const theme = useTheme();
  const [earliestWeight, setEarliestWeight] = useState<number>(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: patient } = usePatient();
  const addWeight = useAddWeightLog();
  const { data: weightLogs } = usePatientWeightLogs();
  const [openModal, setOpenModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [weekStart, setWeekStart] = useState(
    subWeeks(startOfWeek(new Date()), currentWeek)
  );
  const [weekEnd, setWeekEnd] = useState(
    subWeeks(endOfWeek(new Date()), currentWeek)
  );
  const [daySelected, setDaySelected] = useState<Date | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [numberValue, setNumberValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [isUpdateDisabled, setIsUpdateDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (weightLogs?.length) {
      setEarliestWeight(weightLogs[0].weight || 0);
    }
  }, [weightLogs]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numericInput = input.replace(/[^0-9]/g, '');
    const weight = Number(numericInput || 0);
    setNumberValue(weight);

    // Validate weight
    if (weight < 70) {
      setWeightError('Weight must be at least 70 lbs');
      setIsUpdateDisabled(true);
    } else if (weight > 499) {
      setWeightError('Weight must be less than 500 lbs');
      setIsUpdateDisabled(true);
    } else {
      setWeightError(null);
      setIsUpdateDisabled(daySelected === null);
    }
  };

  const handleAddWeightLog = async () => {
    if (!daySelected) {
      toast.error('Please select a date before logging your weight.');
      return;
    }

    // Prevent submission if there are validation errors
    if (weightError) {
      toast.error(weightError);
      return;
    }

    setLoading(true);
    try {
      const logged = await addWeight.mutateAsync({
        patient_id: patient?.id,
        weight: numberValue,
        date_logged: format(daySelected, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      });

      if (
        logged &&
        (logged.status === 201 ||
          logged.status === 200 ||
          logged.status === 204)
      ) {
        setOpenModal(true);
      } else {
        toast.error('Failed to log weight. Please try again.');
      }
    } catch (error) {
      console.error('Error logging weight:', error);
      toast.error('Failed to log weight. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    setSelectedDayIndex(value);
    const selectedDate = addDays(weekStart, value);
    setDaySelected(selectedDate);

    // Validate weight if already entered
    if (numberValue < 70) {
      setWeightError('Weight must be at least 70 lbs');
      setIsUpdateDisabled(true);
    } else if (numberValue > 499) {
      setWeightError('Weight must be less than 500 lbs');
      setIsUpdateDisabled(true);
    } else {
      setWeightError(null);
      setIsUpdateDisabled(false);
    }
  };

  const handleChangeWeek = (direction: string) => {
    if (direction === 'left') {
      setCurrentWeek(cw => cw + 1);
    }
    if (direction === 'right' && currentWeek > 0) {
      setCurrentWeek(cw => cw - 1);
    }
  };

  useEffect(() => {
    setWeekStart(subWeeks(startOfWeek(new Date()), currentWeek));
    setWeekEnd(subWeeks(endOfWeek(new Date()), currentWeek));
  }, [currentWeek]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
        Weight Tracking
      </Typography>
      <Typography fontWeight={600} sx={{ marginBottom: '1rem' }}>
        Track your weight.
      </Typography>
      <Typography sx={{ marginBottom: '3rem' }}>
        Zealthy members who weigh themselves daily are more likely to reach a
        healthy weight and stay there.
      </Typography>

      <Box
        sx={{
          padding: isMobile ? '0.8rem' : '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.375rem',
          borderRadius: '1rem',
          border: '1px solid #D8D8D8',
          background: '#FFFFFF',
        }}
      >
        <Typography fontWeight={600} sx={{ marginBottom: '0.5rem' }}>
          Weight Log
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ArrowLeft
            onClick={() => handleChangeWeek('left')}
            sx={{ cursor: 'pointer' }}
          />
          <Typography>
            {`${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d')}`}
          </Typography>
          {currentWeek > 0 && (
            <ArrowRight
              onClick={() => handleChangeWeek('right')}
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Box>
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="day-of-week-label"
            name="day-of-week-group"
            value={selectedDayIndex !== null ? selectedDayIndex : ''}
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              justifyContent: 'space-evenly',
              maxWidth: '100%',
              marginBottom: '1.5rem',
              marginTop: '0',
              textAlign: 'center',
              alignItems: 'center',
            }}
            onChange={handleRadioChange}
          >
            <FormControlLabel
              sx={{
                maxWidth: '22px',
                height: '22px',
                margin: '0',
              }}
              value={0}
              control={<Radio />}
              label="Sun"
              labelPlacement="bottom"
            />
            <FormControlLabel
              sx={{
                maxWidth: '22px',
                height: '22px',
                margin: '0',
              }}
              value={1}
              control={<Radio />}
              label="Mon"
              labelPlacement="bottom"
            />
            <FormControlLabel
              sx={{
                maxWidth: '22px',
                height: '22px',
                margin: '0',
              }}
              value={2}
              control={<Radio />}
              label="Tue"
              labelPlacement="bottom"
            />
            <FormControlLabel
              sx={{
                maxWidth: '22px',
                height: '22px',
                margin: '0',
              }}
              value={3}
              control={<Radio />}
              label="Wed"
              labelPlacement="bottom"
            />
            <FormControlLabel
              sx={{
                maxWidth: '22px',
                height: '22px',
                margin: '0',
              }}
              value={4}
              control={<Radio />}
              label="Thu"
              labelPlacement="bottom"
            />
            <FormControlLabel
              sx={{
                maxWidth: '22px',
                height: '22px',
                margin: '0',
              }}
              value={5}
              control={<Radio />}
              label="Fri"
              labelPlacement="bottom"
            />
            <FormControlLabel
              sx={{
                maxWidth: '22px',
                height: '22px',
                margin: '0',
              }}
              value={6}
              control={<Radio />}
              label="Sat"
              labelPlacement="bottom"
            />
          </RadioGroup>
        </FormControl>
        <TextField
          label="Weight (lbs)"
          type="number"
          value={numberValue || ''}
          onChange={handleWeightChange}
          inputProps={{ min: 70, max: 499 }}
          error={!!weightError}
          helperText={weightError}
        />
        <LoadingButton
          fullWidth
          loading={loading}
          disabled={loading || isUpdateDisabled || daySelected === null}
          onClick={handleAddWeightLog}
        >
          Log Weight
        </LoadingButton>
        <Button
          color="grey"
          fullWidth
          onClick={() =>
            Router.push(`${Pathnames.PATIENT_PORTAL_WEIGHT_LOGGER}/history`)
          }
        >
          View All
        </Button>
      </Box>
      <Modal open={openModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            backgroundColor: 'white',
            px: 4,
            py: 12,
            borderRadius: 2,
            maxWidth: '476px',
            width: 'calc(100% - 2rem)',
          }}
        >
          <IconButton
            onClick={() => {
              Router.push(`${Pathnames.PATIENT_PORTAL_WEIGHT_LOGGER}/history`);
              setOpenModal(false);
            }}
            sx={{ position: 'absolute', top: 20, right: 20 }}
          >
            <Close />
          </IconButton>

          <Stack gap={4} alignItems="center">
            <HighFive />
            <Typography
              textAlign="center"
              lineHeight="24px"
              fontSize={20}
              fontWeight={700}
              variant="h2"
            >
              {earliestWeight >= numberValue &&
                (isBefore(new Date(), daySelected!) ||
                  isSameDay(new Date(), daySelected!)) &&
                'You’re on the right track!'}
            </Typography>
            <Button
              fullWidth
              onClick={() => {
                Router.push(
                  `${Pathnames.PATIENT_PORTAL_WEIGHT_LOGGER}/history`
                );
                setOpenModal(false);
              }}
            >
              Continue
            </Button>
            <Typography variant="body1">
              You’ve successfully recorded your weight.
            </Typography>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
};

export default WeightLogger;
