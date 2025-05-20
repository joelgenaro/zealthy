import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Create an assessment to analyze the risk of a UI action.
 *
 * projectID: Your Google Cloud Project ID.
 * recaptchaSiteKey: The reCAPTCHA key associated with the site/app
 * token: The generated token obtained from the client.
 * recaptchaAction: Action name corresponding to the token.
 */
// Create the reCAPTCHA client.
const projectID = 'zealthy-386815';
const client = new RecaptchaEnterpriseServiceClient({
  apiKey: process.env.GOOGLE_RECAPTCHA_API_KEY,
  projectId: projectID,
  universeDomain: 'googleapis.com',
});
const projectPath = client.projectPath(projectID);
const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
type CreateAssessmentProps = {
  token: string;
};
async function createAssessment({ token }: CreateAssessmentProps) {
  // Build the assessment request.
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  };
  console.log(request, '');
  const [response] = await client.createAssessment(request);
  // Check if the token is valid.
  if (!response.tokenProperties?.valid) {
    console.log(
      `The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`
    );
    return null;
  }
  console.log(response);
  // Check if the expected action was executed.
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
  console.log(response.tokenProperties);
  if (response.tokenProperties.action === 'LOGIN') {
    // Get the risk score and the reason(s).
    // For more information on interpreting the assessment, see:
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
    response.riskAnalysis?.reasons?.forEach((reason: any) => {
      console.log(reason);
    });

    return response.riskAnalysis?.score;
  } else {
    console.log(
      'The action attribute in your reCAPTCHA tag does not match the action you are expecting to score'
    );
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token, userId } = req.body;

  const score = await createAssessment({ token: token });

  if (userId && score !== null && score !== undefined) {
    try {
      const supabase = createServerSupabaseClient({ req, res });

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ recaptcha_score: score })
        .eq('id', userId);

      if (updateError) {
        console.error(
          'Error updating profile with reCAPTCHA score:',
          updateError
        );
      } else {
        console.log(
          'Successfully updated profile with reCAPTCHA score:',
          score
        );
      }

      if (score < 0.2) {
        try {
          const { data: patientData, error: patientError } = await supabase
            .from('patient')
            .select('id')
            .eq('profile_id', userId)
            .single();

          if (patientError) {
            console.error('Error fetching patient data:', patientError);
            return;
          }

          if (patientData && patientData.id) {
            console.log('Found patient with ID:', patientData.id);

            const { error: taskError } = await supabase
              .from('task_queue')
              .insert({
                patient_id: patientData.id,
                queue_type: 'Lead Coordinator',
                task_type: 'POTENTIAL_FRAUD',
                note: 'Review stripe information to see if the fraud detection is high then call the patient to see if they authorized the payment. If the patient did not authorize the payment then refund the payment. If the patient did authorize the payment then keep the payment.',
              });

            if (taskError) {
              console.error('Error creating fraud task:', taskError);
            } else {
              console.log(
                'Successfully created fraud task for patient ID:',
                patientData.id
              );
            }
          } else {
            console.log('No patient record found for profile ID:', userId);
          }
        } catch (error) {
          console.error('Error in fraud task creation process:', error);
        }
      }
    } catch (error) {
      console.error(
        'Error processing server-side reCAPTCHA verification:',
        error
      );
    }
  } else {
    console.log(`Not updating profile - userId: ${userId}, score: ${score}`);
  }

  res.status(200).json({ response: score });
}
