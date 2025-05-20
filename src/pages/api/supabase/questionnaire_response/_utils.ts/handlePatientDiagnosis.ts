import {
  AnswerItem,
  CodedAnswer,
} from '@/context/AppContext/reducers/types/answer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DiagnosisCode } from './types';

// Type 1 Diabetes: E109

// Pancreatitis: K8590

// Gastroparesis: K3184

// Seizures: G40. 509

// Glaucoma: H409
export function firstScreenerCode(answer: string): DiagnosisCode {
  const codes: { [key: string]: string } = {
    'Type 1 diabetes': 'E109',
    Pancreatitis: 'K8590',
    Gastroparesis: 'K3184',
    Seizures: 'G40509',
    Glaucoma: 'H409',
  };

  if (codes[answer]) {
    return { name: answer, code: codes[answer] };
  } else {
    return null;
  }
}

// Second Screener
// Type 2 Diabetes: E119

// Sleep Apnea: G4733

// Low HDL-C: E786

// High Triglycerides: E781

// Pre-diabetes: R7309

// Heart Disease: I519

// High Blood Pressure: R030

// Osteoarthritis: M1990

// Polycystic Ovarian Syndrome (PCOS): E282

export function secondScreenerCode(answer: string): DiagnosisCode {
  const codes: { [key: string]: string } = {
    'Type 2 diabetes': 'E119',
    'Sleep apnea': 'G4733',
    'Low HDL-C': 'E786',
    'High triglycerides': 'E781',
    Prediabetes: 'R7309',
    'Heart disease': 'I519',
    'High blood pressure': 'R030',
    Osteoarthritis: 'M1990',
    'Polycystic ovarian syndrome (PCOS)': 'E282',
    'Non-alcoholic fatty liver disease': 'K760',
  };
  if (codes[answer]) {
    return { name: answer, code: codes[answer] };
  } else {
    return null;
  }
}

export const handlePatientDiagnosis = async (
  responses: AnswerItem[],
  questionName: string,
  patientId: number,
  diagnosisMapper: (answer: string) => DiagnosisCode
) => {
  const screener = responses?.find(item => item.name === questionName);

  const promises = (screener?.answer as CodedAnswer[])?.map(async a => {
    const code = diagnosisMapper(a?.valueCoding?.display || '');

    if (code) {
      const screenerParams = {
        patient_id: patientId,
        name: code?.name,
        ICD_10: code?.code,
      };

      const exists = await supabaseAdmin
        .from('patient_diagnosis')
        .select()
        .eq('patient_id', patientId)
        .eq('ICD_10', code?.code)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data);

      if (!exists) {
        await supabaseAdmin.from('patient_diagnosis').insert(screenerParams);
      }
    }
  });

  await Promise.allSettled(promises);
  return;
};
