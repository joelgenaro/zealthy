import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  Link,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { usePatientWeightLogs } from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { format, parseISO, sub, isWithinInterval } from 'date-fns';
import { ChangeEventHandler, useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Close } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useUpdateWeightLog } from '@/components/hooks/mutations';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const timeFrames = [
  { name: 'Last 7 days', value: 7 },
  { name: 'Last 14 days', value: 14 },
  { name: 'Last 30 days', value: 30 },
  { name: 'Last 365 days', value: 365 },
];

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
      display: false,
    },
  },
};

const WeightLogger = () => {
  const { data: patientWeightLogs } = usePatientWeightLogs();
  const updateWeight = useUpdateWeightLog();

  const [time, setTime] = useState(365);
  const [data, setData] = useState<any>();
  const [openModal, setOpenModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [dateValue, setDateValue] = useState<string | null | undefined>('');
  const [weightValue, setWeightValue] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [isUpdateDisabled, setIsUpdateDisabled] = useState<boolean>(true);

  function hydrateData() {
    const currentDate = new Date();
    const lastDays = sub(currentDate, { days: time });

    const filteredData = patientWeightLogs?.filter((item: any) => {
      return isWithinInterval(
        new Date(format(parseISO(item.date_logged || ''), 'MMMM dd yyyy')),
        {
          start: lastDays,
          end: currentDate,
        }
      );
    });

    const dates = filteredData?.map((log: any) =>
      format(parseISO(log.date_logged || ''), 'MMMM dd')
    );

    const weights = filteredData?.map((log: any) => log.weight);

    const weightData = [
      {
        label: 'Weight',
        data: weights,
        borderColor: '#00531B',
        backgroundColor: '#327548',
      },
    ];
    setData({
      labels: dates,
      datasets: weightData,
    });
  }

  useEffect(() => {
    if (patientWeightLogs?.length) {
      hydrateData();
    }
  }, [patientWeightLogs, time]);

  const handleTimeFrame: ChangeEventHandler<HTMLInputElement> = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setTime(parseInt(e.target.value, 10));

  const handleUpdateEntry = async () => {
    if (weightError) {
      toast.error(weightError);
      return;
    }

    if (!dateValue || weightValue === null || weightValue === 0) {
      toast.error('Please provide valid date and weight.');
      return;
    }

    setLoading(true);
    try {
      const response = await updateWeight.mutateAsync({
        id: selectedEntry?.id,
        weight: weightValue!,
        date_logged: dateValue!,
      });

      console.log('Update response:', response);

      if (
        response &&
        (response.status === 200 ||
          response.status === 201 ||
          response.status === 204)
      ) {
        toast.success('Weight entry updated successfully!');
        setOpenModal(false);
      } else {
        toast.error('Failed to update weight. Please try again.');
      }
    } catch (error) {
      console.error('Error updating weight:', error);
      toast.error('Failed to update weight. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numericInput = input.replace(/[^0-9]/g, '');
    const weight = Number(numericInput || 0);
    setWeightValue(weight);

    // Validate weight
    if (weight < 70) {
      setWeightError('Weight must be at least 70 lbs');
      setIsUpdateDisabled(true);
    } else if (weight > 499) {
      setWeightError('Weight must be less than 500 lbs');
      setIsUpdateDisabled(true);
    } else {
      setWeightError(null);
      setIsUpdateDisabled(!dateValue);
    }
  };

  const sortedWeightLogs = useMemo(() => {
    return [...(patientWeightLogs || [])].sort((a, b) => {
      return (
        new Date(b.date_logged || '').getTime() -
        new Date(a.date_logged || '').getTime()
      );
    });
  }, [patientWeightLogs]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h2" sx={{ marginBottom: '3rem' }}>
        Weight History
      </Typography>
      <Button
        fullWidth
        onClick={() => Router.push(Pathnames.PATIENT_PORTAL_WEIGHT_LOGGER)}
        sx={{ marginBottom: '3rem' }}
      >
        Log Weight
      </Button>
      <Box
        sx={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.375rem',
          borderRadius: '1rem',
          border: '1px solid #D8D8D8',
          background: '#FFFFFF',
          marginBottom: '3rem',
        }}
      >
        <Typography fontWeight={600} sx={{ marginBottom: '0.5rem' }}>
          Weight Log
        </Typography>
        <FormControl>
          <TextField select fullWidth onChange={handleTimeFrame} value={time}>
            {timeFrames.map(option => (
              <MenuItem key={option.name} value={option.value}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
        {data && (
          <>
            <Line options={options} data={data} />
          </>
        )}
      </Box>
      <Typography fontWeight={600} sx={{ marginBottom: '0.5rem' }}>
        Log History
      </Typography>
      {sortedWeightLogs?.map((log: any) => (
        <Box
          key={log.id}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            marginBottom: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #D8D8D8',
          }}
        >
          <Typography>
            {format(new Date(log.date_logged || ''), 'iiii, MMMM dd, yyyy')}
          </Typography>
          <Typography>
            <Link
              sx={{ marginRight: '1rem', cursor: 'pointer' }}
              onClick={() => {
                setSelectedEntry(log);
                setDateValue(log?.date_logged);
                setWeightValue(log?.weight);
                setWeightError(null);
                setIsUpdateDisabled(false);
                setOpenModal(true);
              }}
            >
              Edit
            </Link>
            {`${log.weight} lbs`}
          </Typography>
        </Box>
      ))}
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
          <Typography
            textAlign="center"
            lineHeight="24px"
            fontSize={20}
            fontWeight={700}
            variant="h2"
            mb="3rem"
          >
            Edit Entry
          </Typography>
          <IconButton
            onClick={() => {
              setOpenModal(false);
              setWeightError(null);
            }}
            sx={{ position: 'absolute', top: 20, right: 20 }}
          >
            <Close />
          </IconButton>

          <Stack gap={4} alignItems="center">
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Date"
                  value={dateValue}
                  onChange={newValue => {
                    setDateValue(newValue);
                    if (weightValue !== null) {
                      if (weightValue < 70) {
                        setWeightError('Weight must be at least 70 lbs');
                        setIsUpdateDisabled(true);
                      } else if (weightValue > 499) {
                        setWeightError('Weight must be less than 500 lbs');
                        setIsUpdateDisabled(true);
                      } else {
                        setWeightError(null);
                        setIsUpdateDisabled(false);
                      }
                    }
                  }}
                  renderInput={params => <TextField {...params} />}
                />
              </LocalizationProvider>
              <TextField
                label="Weight (lbs)"
                type="number"
                value={weightValue || ''}
                onChange={handleWeightChange}
                sx={{ marginTop: '1rem' }}
                inputProps={{ min: 70, max: 499 }}
                error={!!weightError}
                helperText={weightError}
              />
            </FormControl>
            <LoadingButton
              fullWidth
              loading={loading}
              disabled={
                loading ||
                isUpdateDisabled ||
                !dateValue ||
                weightValue === null
              }
              onClick={handleUpdateEntry}
            >
              Save
            </LoadingButton>
            <Button fullWidth color="grey" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
};

export default WeightLogger;
