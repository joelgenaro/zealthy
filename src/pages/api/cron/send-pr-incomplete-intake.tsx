import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { addDays, format, subDays } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!signature || !secret || signature !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const now = new Date().toISOString();
  console.log('NOW: ', now);
  const weightLossQuestionnaires = await supabaseAdmin
    .from('questionnaire_response')
    .select(`*, patient(*, patient_subscription(*)), online_visit(*)`)
    .eq('questionnaire_name', 'weight-loss-post-v2')
    .eq('submitted', false)
    .eq('patient.patient_subscription.status', 'active')
    .lte(
      'created_at',
      format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss zzz')
    )
    .gte('created_at', subDays(new Date(), 7).toISOString())
    .eq('online_visit.status', 'Paid')
    .or(`retry_submission_at.is.null, retry_submission_at.lte.${now}`)
    .limit(10)
    .then(({ data }) => data);

  console.log(weightLossQuestionnaires, 'FIT CRITERIA');

  const results = await Promise.all(
    weightLossQuestionnaires?.map(async questionnaire => {
      const completedClinicalQuestions = (
        questionnaire?.response?.[
          'items' as keyof typeof questionnaire.response
        ] as unknown as Array<any>
      ).some(q => {
        return q.name === 'WEIGHT_L_POST_Q15';
      });
      const patientId = questionnaire.patient_id;
      const patient = await supabaseAdmin
        .from('patient')
        .select('*')
        .eq('id', patientId!)
        .single();
      let updatedPrescriptionRequestId;

      // Unsubmitted Brand Name GLP1 requests
      const prescriptionRequests = await supabaseAdmin
        .from('prescription_request')
        .select('*')
        .eq('patient_id', patientId!)
        .is('queue_id', null)
        .eq('medication_quantity_id', 124)
        .limit(1)
        .then(({ data }) => data);

      // If patient has no requested medications
      if (
        prescriptionRequests?.some(pr => pr.status === 'PRE_INTAKES') &&
        !prescriptionRequests?.some(pr => pr.status?.includes('REQUESTED')) &&
        completedClinicalQuestions
      ) {
        // Submit PR for brand name GLP1
        const unsubmittedPrescriptionRequest = prescriptionRequests?.find(
          pr => pr.status === 'PRE_INTAKES'
        );
        const { data: taskResponse } = await supabaseAdmin
          .from('task_queue')
          .insert({
            task_type: patient.data?.has_verified_identity
              ? 'PRESCRIPTION_REQUEST'
              : 'PRESCRIPTION_REQUEST_ID_REQUIRED',
            patient_id: patientId,
            queue_type: 'Provider (QA)',
            note: 'The patient did not submit their intake but completed the required clinical questions. Please make a clinical decicision if possible.',
          })
          .select()
          .single();

        const { data: response } = await supabaseAdmin
          .from('prescription_request')
          .update({
            queue_id: taskResponse?.id,
            status: patient.data?.has_verified_identity
              ? 'REQUESTED'
              : 'REQUESTED - ID must be uploaded',
            is_visible: true,
          })
          .eq('id', unsubmittedPrescriptionRequest?.id!)
          .select()
          .single();

        // Update questionnaire response
        await supabaseAdmin
          .from('questionnaire_response')
          .update({
            submitted: true,
            submitted_by: patient.data?.profile_id,
          })
          .eq('visit_id', questionnaire.visit_id)
          .eq('questionnaire_name', questionnaire.questionnaire_name);

        // Update visit
        await supabaseAdmin
          .from('online_visit')
          .update({
            status: 'Completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', questionnaire.visit_id);

        // Update patient status to ACTIVE

        await supabaseAdmin
          .from('patient')
          .update({
            status: 'ACTIVE',
          })
          .eq('id', patientId!);

        console.log(
          'Updated PR with ID:',
          response?.id,
          ', for patient ID:',
          patientId,
          ', with queue ID:',
          response?.queue_id
        );
        updatedPrescriptionRequestId = response?.id;
      } else {
        const { error } = await supabaseAdmin
          .from('questionnaire_response')
          .update({
            retry_submission_at: addDays(new Date(), 2).toISOString(),
          })
          .eq('visit_id', questionnaire.visit_id)
          .eq('questionnaire_name', questionnaire.questionnaire_name);
        if (error) {
          console.log(error, 'ERROR!');
        }
        return { patientId: questionnaire.patient_id };
      }
      return { updatedPrescriptionRequestId, patientId };
    }) as Promise<{
      updatedPrescriptionRequestId?: number;
      patientId: number;
    }>[]
  );

  res.status(200).json({ status: 'Success!', results });
}
