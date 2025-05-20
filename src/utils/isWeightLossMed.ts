const weightLossMedNames = [
  'wegovy',
  'ozempic',
  'mounjaro',
  'saxenda',
  'semaglutide',
  'liraglutide',
  'tirzepatide',
  'rybelsus',
  'victoza',
  'bupropion',
  'naltrexone',
  'metfornin',
  'metformin',
  'zepbound',
  'glp1',
  'weight loss',
];

export function isWeightLossMed(medName: string) {
  const medNameLower = medName.toLowerCase();
  return weightLossMedNames.some(med => medNameLower.includes(med));
}
