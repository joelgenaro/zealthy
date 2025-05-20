import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import { useVisitState } from '@/components/hooks/useVisit';
import { usePatient } from '@/components/hooks/data';

interface GileadAssistanceProps {
  nextPage: (nextPage?: string) => void;
}
const prepMedicationId =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 508 : 472;

const GileadAssistance = ({ nextPage }: GileadAssistanceProps) => {
  const supabase = useSupabaseClient();
  const [socialSecurity, setSocialSecurity] = useState('');
  const [householdIncome, setHouseholdIncome] = useState('');
  const [peopleInHousehold, setPeopleInHousehold] = useState('');
  const [vaBenefits, setVaBenefits] = useState<string | null>(null);
  const { data: patient } = usePatient();
  const { id: visitId } = useVisitState();

  const handleSocialSecurityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setSocialSecurity(value);
    }
  };

  const handlePeopleInHouseholdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value)) {
      setPeopleInHousehold(value);
    }
  };

  const handleSubmit = async () => {
    if (
      !socialSecurity ||
      !householdIncome ||
      !peopleInHousehold ||
      vaBenefits === null
    ) {
      toast.error('Please fill out all the fields');
      return;
    }

    const data = {
      items: [
        {
          text: 'Last four of your social security number?',
          answer: [
            {
              valueCoding: {
                display: socialSecurity,
              },
            },
          ],
        },
        {
          text: 'Annual Household Income?',
          answer: [
            {
              valueCoding: {
                display: householdIncome,
              },
            },
          ],
        },
        {
          text: 'Number of people in household?',
          answer: [
            {
              valueCoding: {
                display: peopleInHousehold,
              },
            },
          ],
        },
        {
          text: 'Are you eligible for VA Benefits?',
          answer: [
            {
              valueCoding: {
                display: vaBenefits,
              },
            },
          ],
        },
      ],
    };

    const { data: intakeReponse, error: intakeError } = await supabase
      .from('questionnaire_response')
      .insert({
        visit_id: visitId,
        questionnaire_name: 'gilead-assistance',
        response: data,
        submitted: true,
        patient_id: patient?.id,
      });

    const { data: taskResponse, error: taskError } = await supabase
      .from('task_queue')
      .insert({
        task_type: 'PRESCRIPTION_REQUEST_PREP',
        patient_id: patient?.id,
        queue_type: 'Provider (QA)',
      })
      .select()
      .maybeSingle();

    const { data: prescriptionReponse, error: prescriptionError } =
      await supabase.from('prescription_request').insert({
        patient_id: patient?.id,
        status: 'REQUESTED',
        region: patient?.region,
        shipping_method: 1,
        note: 'Truvada',
        total_price: 0,
        specific_medication: 'Truvada',
        medication_quantity_id: prepMedicationId,
        queue_id: taskResponse.id,
      });
    if (taskError || prescriptionError) {
      toast.error(
        'There was an error saving your information. Please try again.'
      );
    } else {
      window.VWO?.event('gileadSubmittedPrep');
      nextPage();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          Gilead Patient Assistance Program
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          If you lack insurance coverage or have been denied coverage for your
          medication by your insurance plan, Gilead Advancing Access® or Co-Pay
          Program will likely be able to help cover the cost of the drug. In
          order to enroll, you need to answer the following questions. Please
          note, in order to qualify for PrEP at no cost, you must not earn more
          than $62,450 annually. This information is confidential and is only
          shared with the drug maker Gilead and no credit checks are performed.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Last four of your social security number?
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type here..."
          value={socialSecurity}
          onChange={handleSocialSecurityChange}
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 4 }}
        />
        <Typography variant="body2" sx={{ mb: 3 }}>
          If you are not a permanent resident of the United States please enter
          0000.
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Annual Household Income?
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type here..."
          value={householdIncome}
          onChange={e => setHouseholdIncome(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" sx={{ mb: 3 }}>
          Please enter a number greater than or equal to{' '}
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            0
          </Box>
          .
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Number of people in household?
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type here..."
          value={peopleInHousehold}
          onChange={handlePeopleInHouseholdChange}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" sx={{ mb: 3 }}>
          Please enter a number greater than or equal to{' '}
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            0
          </Box>
          .
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Are you eligible for VA Benefits?
        </Typography>
        <RadioGroup
          value={vaBenefits}
          onChange={e => setVaBenefits(e.target.value)}
          sx={{ mb: 3 }}
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>

        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: { bgcolor: '#1B5E20' },
            '&:hover': '#2E7D32',
          }}
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </Box>
    </Container>
  );
};

export default GileadAssistance;
