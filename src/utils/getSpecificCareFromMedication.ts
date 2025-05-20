import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

const ED_MEDICATIONS = ['sildenafil', 'tadalafil'];

const HAIR_LOSS_MEDICATIONS = ['finasteride', 'minoxidil'];

const BIRTH_CONTROL_MEDICATIONS = [
  'blisovi',
  'norethindrone',
  'drospirenone',
  'volnea',
  'tri-estarylla',
  'tri-lo-mili',
  'tri-lo-estarylla',
  'heather',
  'kurvelo',
  'pirmella',
  'syeda',
  'simpesse',
  'sprintec',
  'tri-sprintec',
  'entonogestrel',
  'twirla',
  'levonorgestrel',
];

const ANXIETY_OR_DEPRESSION_MEDICATIONS = [
  'sertraline',
  'citalopram',
  'escitalopram',
  'fluoxetine',
  'paroxetine',
];

const WEIGHT_LOSS_MEDICATIONS = [
  'contrave',
  'phentermine',
  'semaglutide',
  'ozempic',
];

const getSpecificCareFromMedication = (
  medication: string
): SpecificCareOption | null => {
  const med = medication.toLowerCase();
  let specificCare = null;

  ED_MEDICATIONS.forEach(edMed => {
    if (med.includes(edMed)) {
      specificCare = SpecificCareOption.ERECTILE_DYSFUNCTION;
    }
  });

  HAIR_LOSS_MEDICATIONS.forEach(hairLossMed => {
    if (med.includes(hairLossMed)) {
      specificCare = SpecificCareOption.HAIR_LOSS;
    }
  });

  BIRTH_CONTROL_MEDICATIONS.forEach(birthControlMed => {
    if (med.includes(birthControlMed)) {
      specificCare = SpecificCareOption.BIRTH_CONTROL;
    }
  });

  ANXIETY_OR_DEPRESSION_MEDICATIONS.forEach(anxietyOrDepressionMed => {
    if (med.includes(anxietyOrDepressionMed)) {
      specificCare = SpecificCareOption.ANXIETY_OR_DEPRESSION;
    }
  });

  WEIGHT_LOSS_MEDICATIONS.forEach(weightLossMed => {
    if (med.includes(weightLossMed)) {
      specificCare = SpecificCareOption.WEIGHT_LOSS;
    }
  });

  return specificCare;
};

export default getSpecificCareFromMedication;
