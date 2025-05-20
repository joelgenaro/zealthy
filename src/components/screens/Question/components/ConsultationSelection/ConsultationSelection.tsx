import { usePatient } from '@/components/hooks/data';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import OneTimeScheduleVisit from '@/components/screens/OneTimeScheduleVisit';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import VisitSummary from '@/components/shared/VisitSummary';
import { Database } from '@/lib/database.types';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AxiosError, isAxiosError } from 'axios';
import Router, { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ChangeEvent, useState } from 'react';

interface ConsultationSelectionProps {
  nextPage: (nextPage?: string) => void;
}

const ConsultationSelection = ({ nextPage }: ConsultationSelectionProps) => {
  const { data: patient } = usePatient();
  const { push, query } = useRouter();
  const [value, setValue] = useState<string>('chat');
  const [scheduling, setScheduling] = useState(false);

  const supabase = useSupabaseClient<Database>();
  const { updateAppointment } = useAppointmentAsync();

  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  async function handleScheduledAppointment() {
    setScheduling(true);
    if (!appointment) {
      setScheduling(false);
      return;
    }

    return updateAppointment(
      appointment.id,
      {
        status: 'Confirmed',
        paid: true,
        payer_name: null,
      },
      patient!
    )
      .then(async () => {
        await supabase.from('single_use_appointment').insert({
          patient: patient?.id,
          clinician: appointment?.provider?.id!,
          used: true,
          used_on: format(new Date(), 'yyyy-MM-dd'),
        });
        await supabase
          .from('prescription_request')
          .update({
            care_team: [appointment?.provider?.id!],
          })
          .eq('patient_id', patient?.id!)
          .eq('status', 'REQUESTED');
      })
      .then(() => nextPage())
      .catch(error => {
        setScheduling(false);
        if (isAxiosError(error)) {
          const status = (error as AxiosError).response?.status;
          if (status === 422) {
            Router.back();
          }
        }
      });
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  function onContinue() {
    if (value === 'chat') {
      nextPage();
    } else {
      push(
        {
          query: { ...query, page: 'schedule' },
        },
        undefined,
        { shallow: true }
      );
    }
  }

  if (query.page === 'schedule') {
    return <OneTimeScheduleVisit duration={15} />;
  }

  if (query.page === 'confirm') {
    return (
      <Container maxWidth="sm">
        <Stack gap="3rem" maxWidth="500px" margin="0 auto">
          <Stack gap="1rem">
            <Typography variant="h2">Confirm your visit selection</Typography>
            {appointment && appointment.provider && (
              <VisitSummary isConfirmed={false} appointment={appointment} />
            )}
          </Stack>
          <LoadingButton
            loading={scheduling}
            size="large"
            onClick={() => handleScheduledAppointment()}
          >
            Schedule now
          </LoadingButton>
        </Stack>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}
    >
      <Typography variant="h2">
        Select which type of medical consultation you’d like
      </Typography>

      <FormControl style={{ width: '100%' }}>
        <RadioGroup
          aria-labelledby="delivery-options"
          defaultValue="chat"
          name="radio-buttons-group"
          value={value}
          onChange={handleChange}
          style={{ gap: '1rem' }}
        >
          <Box
            onClick={() => setValue('chat')}
            style={{
              width: '100%',
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <Box
              style={{
                width: 'fit-content',
                backgroundColor: '#F7F9A5',
                borderRadius: '8px',
                position: 'absolute',
                right: '-10px',
                top: '-10px',
                padding: '4px 30px',
              }}
            >
              <Typography style={{ fontSize: '14px', fontWeight: '600' }}>
                Fastest!
              </Typography>
            </Box>
            <FormControlLabel
              value="chat"
              control={<Radio />}
              sx={{ marginBottom: '10px', gap: '2rem' }}
              label={
                <>
                  <Typography
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '10px',
                    }}
                  >
                    Chat consultation
                  </Typography>
                  <Typography>
                    Your Zealthy provider will review your responses and ask any
                    follow-up questions through our secure portal within 2
                    business days.
                  </Typography>
                </>
              }
            />
          </Box>
          <Box
            onClick={() => setValue('video')}
            style={{
              width: '100%',
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <FormControlLabel
              value="video"
              control={<Radio />}
              sx={{ marginBottom: '10px', gap: '2rem' }}
              label={
                <>
                  <Typography
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '10px',
                    }}
                  >
                    Video consultation
                  </Typography>
                  <Typography>
                    You’ll schedule time to complete a video call with your
                    provider from your phone or your computer. Your provider
                    will discuss treatment options with you on the video call.
                  </Typography>
                </>
              }
            />
          </Box>
        </RadioGroup>
      </FormControl>
      <Button onClick={onContinue}>Continue</Button>
    </Container>
  );
};

export default ConsultationSelection;
