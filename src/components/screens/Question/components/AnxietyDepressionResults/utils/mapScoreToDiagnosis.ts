export const mapPHQ9ScoreToDiagnosis = (score: number) => {
  if (score > 19) return 'Severe';
  if (score > 14) return 'Moderately Severe';
  if (score > 9) return 'Moderate';
  if (score > 4) return 'Mild';
  return 'No';
};

export const mapGAD7ScoreToDiagnosis = (score: number) => {
  if (score > 14) return 'Severe';
  if (score > 9) return 'Moderate';
  if (score > 4) return 'Mild';
  return 'Minimal';
};
