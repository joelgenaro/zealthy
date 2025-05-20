import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

async function handleRefillPersonalizedPsychiatry(
  patientId: number,
  supabase: SupabaseClient<Database>
) {
  const medication_ids =
    process.env.VERCEL_ENV === 'production'
      ? [
          75, 77, 78, 79, 80, 82, 83, 89, 90, 91, 92, 94, 327, 503, 504, 505,
          506, 507, 125,
        ]
      : [467, 468, 469, 470, 471];
  const { data: patient } = await supabase
    .from('patient')
    .select()
    .eq('id', patientId)
    .single();

  const { data: prescriptions } = await supabase
    .from('prescription')
    .select()
    .in('medication_quantity_id', medication_ids)
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (!prescriptions || prescriptions.length === 0) return;

  for (const prescription of prescriptions) {
    const latestOrder = await supabase
      .from('order')
      .select('*')
      .eq('prescription_id', prescription.id)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data);

    if (!latestOrder) continue;

    const prescription_refill_task = await supabase
      .from('task_queue')
      .insert({
        task_type: 'PRESCRIPTION_REFILL',
        patient_id: patientId,
        queue_type: 'Provider (QA)',
      })
      .select()
      .maybeSingle()
      .then(({ data }) => data);

    const prescription_request = await supabase
      .from('prescription_request')
      .insert({
        patient_id: patient?.id,
        status: 'REQUESTED',
        region: patient?.region,
        shipping_method: 1,
        note: 'Patient requested a Mental Health Medication refill',
        queue_id: prescription_refill_task?.id,
        type: 'Personalized Psychiatry',
        charge: true,
        quantity: 30,
      });
  }
}

export { handleRefillPersonalizedPsychiatry };
