import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { handleAsynchronousVisitComplete } from './handleAsynchronousVisitComplete';
import { handlePersonalPsychiatryVisitComplete } from './handlePersonalPsychiatryVisitComplete';
import { handleSynchronousVisitComplete } from './handleSynchronousVisitComplete';
import { handleWeightLossVisitComplete } from './handleWeightLossVisitComplete';

type OnlineVisit = Database['public']['Tables']['online_visit']['Row'];
type Reason = Database['public']['Tables']['reason_for_visit']['Row'];
type VisitReason = Database['public']['Tables']['visit_reason']['Row'] & {
  reason_for_visit: Reason;
};

export const handleCompleteOnlineVisit = async (visit: OnlineVisit) => {
  let careSelected = visit.specific_care;

  if (!careSelected) {
    careSelected = await supabaseAdmin
      .from('visit_reason')
      .select('*, reason_for_visit!inner(*)')
      .eq('visit_id', visit.id)
      .then(
        ({ data }) => data && (data[0] as VisitReason)?.reason_for_visit?.reason
      );
  }
  const isActiveSubscriber = await supabaseAdmin
    .from('online_visit')
    .select('id')
    .eq('patient_id', visit.patient_id)
    .eq('status', 'Completed')
    .neq('id', visit.id)
    .then(({ data }) => !!data?.length);

  if (!careSelected) {
    console.log({
      message: `Could not find care selection for visit ${visit.id}. Sending default message`,
    });

    return handleAsynchronousVisitComplete(visit, '', isActiveSubscriber);
  }

  if (careSelected === SpecificCareOption.WEIGHT_LOSS) {
    return handleWeightLossVisitComplete(visit, isActiveSubscriber);
  }

  if (careSelected === SpecificCareOption.ANXIETY_OR_DEPRESSION) {
    return handlePersonalPsychiatryVisitComplete(visit, isActiveSubscriber);
  }

  if (visit.synchronous) {
    return handleSynchronousVisitComplete(visit, isActiveSubscriber);
  }

  return handleAsynchronousVisitComplete(
    visit,
    careSelected,
    isActiveSubscriber
  );
};
