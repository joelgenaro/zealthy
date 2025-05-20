import { AnswerItem } from '@/context/AppContext/reducers/types/answer';
import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import differenceBy from 'lodash/differenceBy';
import { SubmitAnswersParams } from '@/types/api/submit-answers';
import { getServiceSupabase } from '@/utils/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method is not supported' });
    return;
  }

  const { visitId, questionnaireName, newAnswers, canvasId, codingSystem } =
    req.body as SubmitAnswersParams;

  try {
    let supabase = createServerSupabaseClient<Database>({ req, res });

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    //temp workaround
    if (!session) {
      const apiKey = req.headers['x-kob-zlt-tkn'];
      if (process.env.KOB_TOKEN !== apiKey) {
        return res.status(401).json({
          message: 'not_authenticated',
          description:
            'The user does not have an active session or is not authenticated',
        });
      }
      supabase = getServiceSupabase();
    }

    // if (!visitId || !questionnaireName) {
    //   throw new Error(
    //     `User: ${session.user.id} has missing attributes: ${JSON.stringify(
    //       req.body
    //     )}`
    //   );
    // }

    // get patient ID
    const patient = await supabase
      .from('online_visit')
      .select('patient_id')
      .eq('id', visitId)
      .limit(1)
      .single();

    //fetch current answers
    const currentAnswers = await supabase
      .from('questionnaire_response')
      .select('response->items')
      .eq('visit_id', visitId)
      .eq('questionnaire_name', questionnaireName)
      .single()
      .then(({ data }) => {
        return (data?.items || []) as AnswerItem[];
      });

    //find the difference between current answers and new answer
    const difference = differenceBy(currentAnswers, newAnswers, 'name');

    let name = questionnaireName;
    if (name === 'sleep') name = 'Insomnia';

    if (name === 'weight-loss-post-v2') {
      const items = difference.concat(newAnswers).map(item => {
        if (item.name.endsWith('_V2')) {
          return {
            ...item,
            followUp: item.followUp,
          };
        }
        return item;
      });

      await supabase.from('questionnaire_response').upsert({
        visit_id: visitId!,
        questionnaire_name: name,
        response: {
          canvas_id: canvasId,
          codingSystem: codingSystem,
          items: items,
        },
        patient_id: patient.data?.patient_id,
      });
    } else {
      // Original handling for other questionnaires
      await supabase.from('questionnaire_response').upsert({
        visit_id: visitId!,
        questionnaire_name: name,
        response: {
          canvas_id: canvasId,
          codingSystem: codingSystem,
          items: difference.concat(newAnswers),
        },
        patient_id: patient.data?.patient_id,
      });
    }

    res.status(200).json({
      message: 'Successfully updated questionnaire response',
    });
  } catch (err) {
    console.error('submit-answers-err', err);
    res.status(422).json({
      message: 'There was an error submitting responses. Please look at logs',
    });
  }
}
