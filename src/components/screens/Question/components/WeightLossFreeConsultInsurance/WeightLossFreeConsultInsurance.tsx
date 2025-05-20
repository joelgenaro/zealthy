import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import Router from 'next/router';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { usePatientState } from '@/components/hooks/usePatient';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface WeightLossFreeConsultInsuranceProps {
  nextPage: () => void;
}

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

const WeightLossFreeConsultInsurance = ({
  nextPage,
}: WeightLossFreeConsultInsuranceProps) => {
  const supabase = useSupabaseClient<Database>();
  const patientState = usePatientState();
  const { removeSpecificCare, addSpecificCare } = useIntakeActions();
  const { addCoaching } = useCoachingActions();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patientState.id
  );
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', 'Zealthy Weight Loss')
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscription(data);
      });
  }, [supabase]);

  const handleInsuranceOption = async () => {
    removeSpecificCare();
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);

    await supabase
      .from('online_visit')
      .update({ status: 'Completed' })
      .eq('patient_id', patientState.id)
      .eq('specific_care', SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT);

    await createVisitAndNavigateAway([SpecificCareOption.WEIGHT_LOSS], {
      navigateAway: false,
      resetValues: false,
      requestedQuestionnaires: [],
      resetMedication: false,
      questionnaires: undefined,
      skipQuestionnaires: [],
    });

    addCoaching({
      type: CoachingType.WEIGHT_LOSS,
      name: 'Zealthy Weight Loss Program',
      id: subscription!.id,
      planId: subscription!.reference_id,
      recurring: { interval: 'month', interval_count: 1 },
      price: subscription!.price,
      discounted_price: 39,
    });

    Router.replace('/questionnaires-v2/weight-loss-v2/WEIGHT_L_Q9');
    return;
  };

  const handlePocketOption = () => {
    nextPage();
    return;
  };

  return (
    <Container disableGutters sx={{ width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          padding: 4,
          backgroundColor: '#E6F2EA',
          borderRadius: 5,
        }}
      >
        <Typography variant="h2" fontWeight="bold">
          Pay Out of Pocket
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Zealthy’s low cost out-of-pocket options get you covered when
          insurance won’t.
        </Typography>
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Get Started on Compounded Semaglutide for as low as $151/mo and
          Compounded Tirzepatide for as low as $216 per month.
        </Typography>
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Immediate access to the best GLP-1 medications from Zealthy’s
          thoroughly vetted compounding pharmacies.
        </Typography>

        <Button
          variant="contained"
          sx={{ marginTop: 2 }}
          onClick={handlePocketOption}
          fullWidth
        >
          See a provider
        </Button>

        <Typography variant="body2" sx={{ marginTop: 1, fontStyle: 'italic' }}>
          *Pricing is per month and must be paid up front or using Klarna.
        </Typography>

        <Typography variant="h2" fontWeight="bold" sx={{ marginTop: 3 }}>
          Insurance
        </Typography>
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          The free consultation is available only for out-of-pocket customers.
          Those using insurance must sign up for our membership, complete
          additional questions, and upload documentation. We’ll notify you once
          approved to complete your order.
        </Typography>
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Upload your insurance documents to your Zealthy coordinator team to
          begin prior authorization for GLP-1 medications. We’ll help lower
          brand-name GLP-1 costs from $1,349 to as low as $25 per month.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={handleInsuranceOption}
        >
          Upload insurance information
        </Button>
      </Box>
    </Container>
  );
};

export default WeightLossFreeConsultInsurance;
