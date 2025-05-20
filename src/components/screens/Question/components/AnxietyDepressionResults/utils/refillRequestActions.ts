import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { usePatient } from '@/components/hooks/data';
import { addDays, addWeeks, formatISO, isAfter } from 'date-fns';
import { useCallback } from 'react';
import { psychiatryRefillCompleted } from '@/utils/freshpaint/events';

export const useHandleRefillRequest = () => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  function updateLatestRefillRequestItem() {
    async function update() {
      const { data: latestItem } = await supabase
        .from('patient_action_item')
        .select('id')
        .eq('patient_id', patient?.id!)
        .eq('type', 'REFILL_REQUEST_PS')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (latestItem) {
        await supabase
          .from('patient_action_item')
          .update({ completed: true })
          .eq('id', latestItem.id);
      }
    }

    return update();
  }

  function addRefillRequestActionItem() {
    async function addActionItem() {
      const dateInTenWeeks = formatISO(addWeeks(new Date(), 10));
      patient?.id &&
        (await supabase.from('patient_action_item').insert({
          created_at: dateInTenWeeks,
          completed: false,
          path: '/patient-portal/mental-health/refill-request',
          patient_id: patient?.id,
          type: 'REFILL_REQUEST_PS',
          title: 'Complete your refill request',
          body: `It's time to fullfill your refill request. Please help us stay on top of your mental health journey.`,
        }));
    }
    return addActionItem();
  }

  function addPrescriptionRefillTask() {
    async function addTask() {
      const { data: latestRefill } = await supabase
        .from('task_queue')
        .select()
        .eq('patient_id', patient?.id!)
        .eq('task_type', 'PRESCRIPTION_REFILL')
        .eq('visible', true)
        .eq('queue_type', 'Provider')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const date = new Date(latestRefill?.created_at!);
      const nextRefillDate = formatISO(addDays(new Date(), 20));
      if (isAfter(date, new Date()) && latestRefill) {
        await supabase
          .from('task_queue')
          .update({
            created_at: nextRefillDate,
          })
          .eq('id', latestRefill?.id);
      }
    }
    return addTask();
  }

  const handleRefillRequest = useCallback(async () => {
    return updateLatestRefillRequestItem()
      .then(() => addRefillRequestActionItem())
      .then(() => addPrescriptionRefillTask())
      .then(() =>
        psychiatryRefillCompleted(patient?.profiles.id, patient?.profiles.email)
      );
  }, [
    updateLatestRefillRequestItem,
    addRefillRequestActionItem,
    addPrescriptionRefillTask,
  ]);

  return { handleRefillRequest };
};
