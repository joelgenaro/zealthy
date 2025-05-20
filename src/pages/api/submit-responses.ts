import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';
export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return;

  const { user_id } = req.body;

  if (!user_id) {
    return res.status(401).json({
      error: 'Not authorized',
    });
  }

  try {
    const supabase = getServiceSupabase();

    const patient = await supabase
      .from('patient')
      .select('id, canvas_patient_id')
      .eq('profile_id', user_id)
      .single()
      .then(({ data }) => data);

    if (!patient) {
      res.status(422).json({
        error: `Patient can not be null for user ${user_id}`,
      });
      return;
    }

    const visit = await supabase
      .from('online_visit')
      .select('id')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data);

    if (!visit) {
      res.status(422).json({
        error: `Visit can not be null for patient ${patient.id}`,
      });
      return;
    }

    const responses = await supabase
      .from('questionnaire_response')
      .select('*')
      .eq('visit_id', visit.id)
      .eq('submitted', false);

    if (!responses.data) {
      return res.status(500).json({
        error: 'No responses to submit',
      });
    }

    const responseData = await Promise.all(
      responses.data.map(async data => {
        await supabase
          .from('questionnaire_response')
          .update({
            submitted: true,
            patient_id: patient.id,
          })
          .match({
            questionnaire_name: data.questionnaire_name,
            visit_id: visit.id,
          });
        return {
          questionnaire_name: data.questionnaire_name,
          visit_id: visit.id,
          submitted: true,
          patient_id: patient.id,
        };
      })
    );

    res.status(200).json(responseData);
  } catch (error: any) {
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
