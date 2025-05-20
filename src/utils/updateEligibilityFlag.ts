import {
  isBirthControlCandidate,
  isEDCandidate,
  isEnclomipheneCandidate,
  isSleepCandidate,
} from './eligibilityChecks';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export const updateEligibilityFlags = async (
  supabase: SupabaseClient<Database>,
  patientId: string | number,
  questionnaireName: string
) => {
  if (!patientId) {
    console.log('[Eligibility] No patient ID, skipping eligibility update');
    return;
  }

  try {
    console.log(
      `[Eligibility] Processing eligibility for ${questionnaireName}`
    );

    const eligibilityMap: Record<
      string,
      {
        field: string;
        checkFunction: (intakes: any[]) => boolean;
      }
    > = {
      'birth-control': {
        field: 'birth_control_eligible',
        checkFunction: isBirthControlCandidate,
      },
      ed: {
        field: 'ed_eligible',
        checkFunction: isEDCandidate,
      },
      enclomiphene: {
        field: 'enclomiphene_eligible',
        checkFunction: isEnclomipheneCandidate,
      },
      Insomnia: {
        field: 'sleep_eligible',
        checkFunction: isSleepCandidate,
      },
    };

    if (!eligibilityMap[questionnaireName]) {
      console.log(
        `[Eligibility] No eligibility flag for questionnaire: ${questionnaireName}`
      );
      return;
    }

    const { field, checkFunction } = eligibilityMap[questionnaireName];

    const { data: patientData, error: patientError } = await supabase
      .from('patient')
      .select(field)
      .eq('id', patientId)
      .single();

    if (patientError) {
      console.error('[Eligibility] Error fetching patient:', patientError);
      return;
    }

    const currentFlag = patientData[field as keyof typeof patientData];

    console.log(`[Eligibility] Current ${field} value:`, currentFlag);

    const { data: patientIntakes, error: intakesError } = await supabase
      .from('questionnaire_response')
      .select('*')
      .eq('patient_id', patientId);

    if (intakesError) {
      console.error('[Eligibility] Error fetching intakes:', intakesError);
      return;
    }

    const newFlagValue = checkFunction(patientIntakes || []);
    console.log(`[Eligibility] Calculated ${field} value:`, newFlagValue);

    if (currentFlag !== newFlagValue) {
      console.log(
        `[Eligibility] Value changed, updating ${field} from ${currentFlag} to ${newFlagValue}`
      );

      const updates = { [field]: newFlagValue };
      const { data, error: updateError } = await supabase
        .from('patient')
        .update(updates)
        .eq('id', patientId)
        .select();

      if (updateError) {
        console.error('[Eligibility] Error updating flag:', updateError);
        return undefined;
      } else {
        console.log(
          '[Eligibility] Successfully updated eligibility flag',
          currentFlag || newFlagValue
        );
        return data;
      }
    } else {
      console.log(`[Eligibility] Value unchanged, skipping database update`);
      return patientData;
    }
  } catch (error) {
    console.error('[Eligibility] Unexpected error:', error);
    return undefined;
  }
};
