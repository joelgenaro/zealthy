import { OnlineVisit } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

const priorities: { [key: string]: number } = {
  'Weight loss': 8,
  Enclomiphene: 7,
  'Mental health': 6,
  'Erectile dysfunction': 5,
  'Anxiety or depression': 4,
  'Hair loss': 3,
  'Primary care': 2,
  'Birth control': 1,
  Skincare: 1,
  Other: 0,
};

const sortingByPriorities = (v1: OnlineVisit, v2: OnlineVisit) => {
  const priority1 = priorities[v1.reason_for_visit[0].reason || 'Other'];
  const priority2 = priorities[v2.reason_for_visit[0].reason || 'Other'];

  return priority2 - priority1;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.getzealthy.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, webflow-auth'
  );
  // If you need to allow cookies or other credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.headers['webflow-auth'] !== process.env.WEBFLOW_AUTH_KEY) {
    res.status(401).json({ status: 'Unauthorized' });
  }
  const supabase = createServerSupabaseClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log('SESSION', JSON.stringify(session));
  const profileId = session?.user.id;
  console.log('PROFILE ID', profileId);
  if (!profileId) {
    res.status(404).json({ status: 'Not found' });
  }
  const patient = await supabase
    .from('patient')
    .select('*, profiles(*)')
    .eq('profile_id', profileId!)
    .single();
  const patientActionItems = await supabase
    .from('patient_action_item')
    .select('*')
    .lte('created_at', new Date().toISOString())
    .eq('completed', false)
    .eq('patient_id', patient.data?.id!)
    .then(data => data.data);

  const onlineVisits = await supabaseAdmin
    .from('online_visit')
    .select('*, reason_for_visit(*)')
    .in('status', ['Paid', 'Created'])
    .eq('patient_id', patient?.data?.id!)
    .order('updated_at', { ascending: false })
    .then(({ data }) => (data || []) as OnlineVisit[]);

  const visits = onlineVisits
    .filter(v => {
      if (v.potential_insurance === 'Weight Loss Continue') {
        return false;
      }

      const reasons = v.reason_for_visit.map(r => r.reason);

      if (!reasons.length) return false;

      return !reasons.includes('Other') && !reasons.includes('I’m not sure');
    })
    .sort(sortingByPriorities);

  const rateCoachActionItem = patientActionItems?.find(
    ai => ai.type === 'RATE_COACH' && new Date(ai.created_at) <= new Date()
  );

  const actionItems = patientActionItems?.filter(ai => {
    if (ai.type === 'RATE_COACH') {
      // Only show one RATE_COACH item (the most recent one that's due now)
      return ai.id === rateCoachActionItem?.id;
    }
    return true;
  });

  res.status(200).json({
    actionItems: [],
    onlineVisits: visits.length > 0 ? [visits[0]] : [],
  });
}
