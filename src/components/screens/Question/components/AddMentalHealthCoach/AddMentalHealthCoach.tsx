import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Database } from '@/lib/database.types';
import { Questionnaire } from '@/types/questionnaire';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useMemo, useState, useEffect, useCallback } from 'react';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

interface AddMentalHealthCoachProps {
  onNext: (nextPage?: string) => void;
  questionnaire: Questionnaire;
}

const AddMentalHealthCoach = ({
  onNext,
  questionnaire,
}: AddMentalHealthCoachProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { addCoaching, removeCoaching } = useCoachingActions();
  const supabase = useSupabaseClient<Database>();
  const name = 'Mental Health Coaching';
  const recurring = useMemo(
    () => ({
      interval: 'month',
      interval_count: 1,
    }),
    []
  );

  const nextPage =
    questionnaire.name === 'mental-health-add-schedule-coach'
      ? 'MENTAL_C_INTRO'
      : undefined;

  useEffect(() => {
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', name)
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscription(data);
      });
  }, [supabase]);

  const handleContinue = useCallback(() => {
    addCoaching({
      type: CoachingType.MENTAL_HEALTH,
      name,
      id: subscription!.id,
      planId: subscription!.reference_id,
      recurring,
      price: subscription!.price,
      discounted_price: 49,
    });
    onNext(nextPage);
  }, [addCoaching, nextPage, onNext, recurring, subscription]);

  const handleSkip = useCallback(() => {
    removeCoaching(CoachingType.MENTAL_HEALTH);
    onNext();
  }, [onNext, removeCoaching]);
  return (
    <Stack gap="16px">
      <Button onClick={handleContinue}>Add 1:1 Coaching</Button>
      <Button color="grey" onClick={handleSkip}>
        Continue without coaching
      </Button>
    </Stack>
  );
};

export default AddMentalHealthCoach;
