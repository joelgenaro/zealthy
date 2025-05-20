import { AnswerItem } from '@/context/AppContext/reducers/types/answer';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { processWeightLossBundledQuestionnaire } from './_utils.ts/processWeightLossBundledQuestionnaire';
import { processWeightLossPostBundledQuestionnaire } from './_utils.ts/processWeightLossPostBundledQuestionnaire';
import { processWeightLossPostQuestionnaire } from './_utils.ts/processWeightLossPostQuestionnaire';
import { processWeightLossQuestionnaire } from './_utils.ts/processWeightLossQuestionnaire';
import { processWeightLossV2Questionnaire } from './_utils.ts/processWeightLossV2Questionnaire';
import { processWeightLossPostV2Questionnaire } from './_utils.ts/processWeightLossPostV2Questionnaire';

type QuestionnaireResponse =
  Database['public']['Tables']['questionnaire_response']['Row'];

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: QuestionnaireResponse;
  old_record: QuestionnaireResponse;
};

type Response = {
  items: AnswerItem[];
};

type Patient = {
  id: number;
  canvas_patient_id: string | null;
};

const handleUpdateQuestionnaireResponse = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record, old_record } = req.body as UpdatePayload;

    if (old_record.submitted === false && record.submitted === true) {
      // find patient
      const patient = await supabaseAdmin
        .from('online_visit')
        .select('patient!inner(id, canvas_patient_id)')
        .eq('id', record.visit_id)
        .maybeSingle()
        .then(({ data }) => data?.patient as Patient);

      if (!patient) {
        throw new Error(
          `Could not find patient for visit id: ${record.visit_id}`
        );
      }

      if (record.questionnaire_name === 'weight-loss') {
        await processWeightLossQuestionnaire(record, patient);
      }

      if (record.questionnaire_name === 'weight-loss-v2') {
        await processWeightLossV2Questionnaire(record, patient);
      }

      if (record.questionnaire_name === 'weight-loss-bundled') {
        await processWeightLossBundledQuestionnaire(record, patient);
      }

      if (record.questionnaire_name === 'weight-loss-post') {
        await processWeightLossPostQuestionnaire(record, patient);
      }

      if (record.questionnaire_name === 'weight-loss-post-v2') {
        await processWeightLossPostV2Questionnaire(record, patient);
      }

      if (record.questionnaire_name === 'weight-loss-post-bundled') {
        await processWeightLossPostBundledQuestionnaire(record, patient);
      }
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    console.log({ ERROR: err });
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdateQuestionnaireResponse(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(
    req,
    res,
    handleUpdateQuestionnaireResponse
  );
}
