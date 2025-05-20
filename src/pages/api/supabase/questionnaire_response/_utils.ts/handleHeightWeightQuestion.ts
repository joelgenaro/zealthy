import {
  AnswerItem,
  FreeTextAnswer,
} from '@/context/AppContext/reducers/types/answer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcBmiIndex } from '@/utils/calcBmiIndex';

// 27-30: Overweight: E663

// 30-40: Obese: E669

// 40+: Morbidly Obese: E6601
function bmiICDCode(bmi: number) {
  if (bmi >= 27 && bmi <= 30) {
    return { name: 'Overweight', code: 'E663' };
  } else if (bmi > 30 && bmi <= 40) {
    return { name: 'Obesity', code: 'E669' };
  } else if (bmi > 40) {
    return { name: 'Morbidly Obese', code: 'E6601' };
  }
}

function extractBMIFromHeightWeight(
  responses: AnswerItem[],
  questionName: string
) {
  const heightWeight = responses?.find(item => item.name === questionName);

  if (heightWeight) {
    const [ft, inch] = (heightWeight.answer[0] as FreeTextAnswer).valueString
      .split('Height: ')[1]
      .split(',')[0]
      .split("'")
      .map(s => s.replace(/\W/g, ''))
      .map(Number);

    const height = ft! * 12 + inch!;

    const weight = (heightWeight.answer[0] as FreeTextAnswer).valueString
      .split('Weight: ')[1]
      .split(',')
      .map(Number)[0];

    return calcBmiIndex(height, weight);
  }

  return 0;
}

export const handleHeightWeightQuestion = async (
  responses: AnswerItem[],
  questionName: string,
  patientId: number
) => {
  const bmi = extractBMIFromHeightWeight(responses, questionName);

  const bmiWeightCode = bmiICDCode(bmi);
  const bmiParams = {
    patient_id: patientId,
    name: bmiWeightCode?.name,
    ICD_10: bmiWeightCode?.code,
  };

  const bmiExists = await supabaseAdmin
    .from('patient_diagnosis')
    .select()
    .eq('patient_id', patientId)
    .eq('ICD_10', bmiWeightCode?.code!)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data);
  console.log(bmiExists, 'existsfiurst');

  if (!bmiExists) {
    await supabaseAdmin.from('patient_diagnosis').insert(bmiParams);
  }

  return;
};
