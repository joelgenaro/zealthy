import { PatientProps } from '@/components/hooks/data';
import { usePatientAsync } from '@/components/hooks/usePatient';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import { useVisitAsync, useVisitState } from '@/components/hooks/useVisit';
import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import axios from 'axios';
import { format } from 'date-fns';
import Router from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ConfirmationProps {
  onNext?: () => void;
  recurringMedicationSub?: any | null;
  patient?: PatientProps;
}

export function SameMedication({
  onNext,
  recurringMedicationSub,
}: ConfirmationProps) {
  const { medications } = useVisitState();
  const [loading, setLoading] = useState(false);
  const { updatePatient: updatePatientAsync } = usePatientAsync();
  const { updateOnlineVisit: updateVisitAsync } = useVisitAsync();
  const submitQuestionnaireResponses = useQuestionnaireResponses();

  async function handleConfirm() {
    console.log(recurringMedicationSub, 'recSub');
    setLoading(true);
    const { refill } = Router.query;

    // update date in order to change subscription trialing status to active, which will automatically trigger a charge
    try {
      await axios.post('/api/stripe/utils/subscription/change-date', {
        referenceId: recurringMedicationSub?.reference_id,
        newDate: 'now',
      });

      if (refill === 'true') {
        await Promise.allSettled([
          updatePatientAsync({
            last_refill_request: new Date().toISOString(),
          }),
          updateVisitAsync({
            status: 'Completed',
            completed_at: new Date().toISOString(),
          }),
          submitQuestionnaireResponses(),
        ]);
      }
      toast.success('Order has been sent to pharmacy.');

      onNext ? onNext() : Router.push('/patient-portal');
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Stack>
      <Typography variant="h2" textAlign="center" mb="1rem">
        {`Confirm that you would like to order your next supply of medication for the next  ${
          medications[0]?.recurring?.interval_count === 30 ? '30' : '90'
        } days.`}
      </Typography>
      <Typography
        textAlign="center"
        mb="1rem"
      >{`You will be charged now, instead of   ${format(
        recurringMedicationSub?.current_period_end &&
          !isNaN(new Date(recurringMedicationSub.current_period_end).getTime())
          ? new Date(recurringMedicationSub.current_period_end)
          : new Date(),
        'MMMM d, yyyy'
      )}, and your next shipment of ${
        medications[0]?.name?.split(' ')[0]
      } will be shipped within 3-5 business days and you will continue to receive your medication every ${
        medications[0]?.recurring?.interval_count === 30 ? '30' : '90'
      } days.`}</Typography>
      <Typography textAlign="center">{`Price: $${medications[0]?.price}`}</Typography>
      <Typography textAlign="center" mb="1rem">{`Quantity: ${
        medications[0]?.name?.split(' ')[0]
      } ${medications[0]?.dosage}`}</Typography>
      <Button disabled={loading} onClick={handleConfirm}>
        Confirm
      </Button>
    </Stack>
  );
}
