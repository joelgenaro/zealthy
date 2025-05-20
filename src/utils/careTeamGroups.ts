export const careTeamGroups = [
  'AMH', // maintaining for backwards comp -- Mental Health is the primary
  'Acne Treatment', // Leaving this for backwards compatibility, but should be replaced with Skincare
  'Birth Control',
  'ED',
  'Enclomiphene',
  'Erectile Dysfunction',
  'Hair Loss',
  'Mental Health',
  'Performance Protocol',
  'Primary Care',
  'Psychiatry',
  'Skincare',
  'Urgent Care',
  'Weight Loss',
  'PrEP',
  'Menopause',
  'Sleep',
  'Sex + Hair',
  'Sleep Support',
  'Weight Loss Free Consult',
  'Other',
] as const;

export type CareTeamGroup = (typeof careTeamGroups)[number] | null;
