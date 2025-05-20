export type NonGLP1MEdication = {
  brand: string;
  medicationNames: string[];
  drug: string;
  body1: string;
  body2: string;
  body3: string;
};

export const medications: NonGLP1MEdication[] = [
  {
    brand: 'Bupropion and Naltrexone',
    medicationNames: ['bupropion', 'naltrexone'],
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupoprion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    medicationNames: ['metformin'],
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];
export const medicationsCA: NonGLP1MEdication[] = [
  {
    brand: 'Metformin',
    medicationNames: ['metformin'],
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];

export const details: {
  [key: string]: {
    title: string;
    overview: string;
    results: string;
    cost: string;
  };
} = {
  'Bupropion and Naltrexone': {
    title: 'Bupropion and Naltrexone',
    overview:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss. ',
    results:
      'Most patients who use Bupoprion and Naltrexone will lose 5 to 8% of their body weight over a year.',
    cost: 'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy. ',
  },
  Metformin: {
    title: 'Metformin',
    overview:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
    cost: 'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
  },
};
export const detailsCA: {
  [key: string]: {
    title: string;
    overview: string;
    results: string;
    cost: string;
  };
} = {
  Metformin: {
    title: 'Metformin',
    overview:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
    cost: 'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
  },
};
