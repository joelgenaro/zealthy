import { supabaseAdmin } from '@/lib/supabaseAdmin';

const handleNextCoordinator = async () => {
  let leastPatients: { clinician: any | null; total: number } = {
    clinician: null,
    total: Infinity,
  };

  const allCoordinators = await supabaseAdmin
    .from('clinician')
    .select('*, profiles (*)')
    .eq('status', 'ON')
    .overlaps('type', [
      'Coordinator (All)',
      'Coordinator (PAs)',
      'Coordinator (Messages)',
    ]);

  for (const c of allCoordinators.data || []) {
    const totalPatients = await supabaseAdmin
      .from('patient_care_team')
      .select('*', { count: 'exact' })
      .eq('clinician_id', c.id);

    if (leastPatients.total > (totalPatients.count ?? 0)) {
      leastPatients = { clinician: c, total: totalPatients.count ?? 0 };
    }
  }

  return leastPatients;
};

export const findCoordinator = async (foundCoordinator: any) => {
  if (!foundCoordinator) {
    return handleNextCoordinator();
  } else {
    return supabaseAdmin
      .from('clinician')
      .select('*, profiles (*)')
      .eq('id', foundCoordinator?.clinician_id)
      .single()
      .then(({ data }) => {
        return { clinician: data, total: 1 };
      });
  }
};
