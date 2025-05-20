import {
  AnswerItem,
  CodedAnswer,
  FreeTextAnswer,
} from '@/context/AppContext/reducers/types/answer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function specificMedicationExtract(
  responses: AnswerItem[],
  questionName: string
) {
  const specificMedicationScreener = responses?.find(
    item => item.name === questionName
  );
  console.log(specificMedicationScreener, 'first');
  if (
    !specificMedicationScreener ||
    (specificMedicationScreener?.answer as CodedAnswer[])?.[0]?.valueCoding
      ?.display === 'None of the above'
  ) {
    return '';
  } else {
    const medicationHistory = (
      specificMedicationScreener?.answer as CodedAnswer[]
    )?.map(a => ` ${a.valueCoding.display}`);
    return `${medicationHistory?.map(m => m.toLowerCase())}.`;
  }
}

// Non-Alcoholic Fatty Liver Disease: K760
function allergyExtract(responses: AnswerItem[], questionName: string) {
  const allergyScreener = responses?.find(item => item.name === questionName);
  console.log(allergyScreener, 'first');
  if (
    !allergyScreener ||
    (allergyScreener?.answer as FreeTextAnswer[])?.[0]?.valueString.length < 1
  ) {
    return '';
  } else {
    const allergies =
      (allergyScreener?.answer as FreeTextAnswer[])?.[0]?.valueString || '';
    return `${allergies}.`;
  }
}

function medicationOrSupplementExtract(
  responses: AnswerItem[],
  questionName: string
) {
  const isV2 = responses.some(item => item.name === `${questionName}_V2`);

  if (isV2) {
    const v2Response = responses.find(
      item => item.name === `${questionName}_V2`
    );

    const v2Answer = v2Response?.answer as CodedAnswer[];
    const hasYesAnswer =
      v2Answer &&
      v2Answer[0] &&
      v2Answer[0].valueCoding &&
      v2Answer[0].valueCoding.code === `${questionName}_V2_A1`;

    if (hasYesAnswer) {
      const followUpResponse = responses.find(
        item => item.name === `${questionName}_V2_1`
      );

      if (
        !followUpResponse ||
        (followUpResponse?.answer as FreeTextAnswer[])?.[0]?.valueString
          .length < 1
      ) {
        return '';
      }

      const followUpText = (followUpResponse?.answer as FreeTextAnswer[])[0]
        ?.valueString;
      return `${followUpText}.`;
    } else {
      return '';
    }
  } else {
    const medicalConditionsScreener = responses?.find(
      item => item.name === questionName
    );

    if (
      !medicalConditionsScreener ||
      (medicalConditionsScreener?.answer as FreeTextAnswer[])?.[0]?.valueString
        .length < 1
    ) {
      return '';
    } else {
      const medicationConditions = (
        medicalConditionsScreener?.answer as FreeTextAnswer[]
      )[0]?.valueString;
      return `${medicationConditions}.`;
    }
  }
}

function medicalConditionExtract(
  responses: AnswerItem[],
  questionName: string
) {
  const medicalConditionsScreener = responses?.find(
    item => item.name === questionName
  );
  console.log(medicalConditionsScreener, 'first');
  if (
    !medicalConditionsScreener ||
    (medicalConditionsScreener?.answer as FreeTextAnswer[])?.[0]?.valueString
      .length < 1
  ) {
    return '';
  } else {
    const medicationConditions = (
      medicalConditionsScreener?.answer as FreeTextAnswer[]
    )[0]?.valueString;
    return `${medicationConditions}.`;
  }
}

type QuestionToExtract = {
  allergyQuestion?: string;
  specificMedicationQuestion?: string;
  supplementQuestion?: string;
  medicalConditionQuestion?: string;
};

export const handleMedicationHistory = async (
  responses: AnswerItem[],
  patientId: number,
  questions: QuestionToExtract
) => {
  const medicalHistory = await supabaseAdmin
    .from('medical_history')
    .select()
    .eq('patient_id', patientId)
    .single()
    .then(({ data }) => data);

  const allergies = [medicalHistory?.allergies || ''];
  const current_medications = [medicalHistory?.current_medications || ''];
  const medical_conditions = [medicalHistory?.medical_conditions || ''];

  if (questions.allergyQuestion) {
    const allergyScreener = allergyExtract(
      responses,
      questions.allergyQuestion
    );

    allergies.push(allergyScreener);
  }

  if (questions.specificMedicationQuestion) {
    const currentMedications = specificMedicationExtract(
      responses,
      questions.specificMedicationQuestion
    );

    current_medications.push(currentMedications);
  }

  if (questions.supplementQuestion) {
    const medicationOrSupplements = medicationOrSupplementExtract(
      responses,
      questions.supplementQuestion
    );

    current_medications.push(medicationOrSupplements);
  }

  if (questions.medicalConditionQuestion) {
    const medicalCondition = medicalConditionExtract(
      responses,
      questions.medicalConditionQuestion
    );

    medical_conditions.push(medicalCondition);
  }

  console.log({
    ALLERGIES: allergies,
    CURRENT_MEDICATIONS: current_medications,
    MEDICAL_CONDITION: medical_conditions,
  });

  await supabaseAdmin.from('medical_history').upsert({
    patient_id: patientId,
    allergies: allergies.filter(Boolean).join(', '),
    current_medications: current_medications.filter(Boolean).join(', '),
    medical_conditions: medical_conditions.filter(Boolean).join(', '),
  });

  return;
};
