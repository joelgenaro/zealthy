import { Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Loading from '@/components/shared/Loading/Loading';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import { Database } from '@/lib/database.types';
import { useIntakeState } from '@/components/hooks/useIntake';
import VisitSelectionForm from './components/VisitSelectionForm';
import {
  useActivePatientSubscription,
  usePatient,
} from '@/components/hooks/data';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';

const VisitSelection = () => {
  const { ilvEnabled } = useIntakeState();
  const { data: patientInfo } = usePatient();
  const sexAtBirth = patientInfo?.profiles?.gender;
  const { data: subscriptions } = useActivePatientSubscription();

  const weightLossSubscription = useMemo(() => {
    return subscriptions?.find(s =>
      s.subscription.name.includes('Weight Loss')
    );
  }, [subscriptions]);

  const personalizedPsychiatrySubscription = useMemo(() => {
    return subscriptions?.find(s =>
      s.subscription.name.includes('Personalized Psychiatry')
    );
  }, [subscriptions]);

  const supabase = useSupabaseClient<Database>();
  const [reasons, setReasons] = useState<ReasonForVisit[]>();

  const handleSetReasons = useCallback(async () => {
    if (!sexAtBirth) {
      return;
    }
    let query = supabase
      .from('reason_for_visit')
      .select('id, reason, synchronous')
      .order('order', { ascending: true })
      .neq('reason', 'Weight Loss Free Consult')
      .eq(sexAtBirth, true)
      .eq('group', 'DEFAULT');

    if (weightLossSubscription) {
      query = query.neq('reason', 'Weight loss');
    }

    if (personalizedPsychiatrySubscription) {
      query = query.neq('reason', 'Anxiety or depression');
    }

    await query.then(({ data }) => setReasons(data || []));
  }, [
    personalizedPsychiatrySubscription,
    sexAtBirth,
    supabase,
    weightLossSubscription,
  ]);

  useEffect(() => {
    if (sexAtBirth) {
      handleSetReasons();
    }
  }, [handleSetReasons, sexAtBirth]);

  return (
    <CenteredContainer maxWidth="sm">
      <Typography variant="h2">How can we help you today?</Typography>

      {reasons ? <VisitSelectionForm selections={reasons} /> : <Loading />}
    </CenteredContainer>
  );
};

export default VisitSelection;
