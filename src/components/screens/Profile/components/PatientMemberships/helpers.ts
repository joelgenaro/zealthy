export const parseSubName = (sub: string) => {
  const names: { [key: string]: string } = {
    'Zealthy Subscription': 'Primary Care Membership',
    'Mental Health Coaching': 'Mental Health Coaching Plan',
    'Zealthy Weight Loss': 'Weight Loss Plan',
    'Zealthy 3-Month Weight Loss': 'Zealthy 3-Month Weight Loss',
    'Zealthy 3-Month Weight Loss [IN]': 'Zealthy 3-Month Weight Loss',
    'Zealthy 6-Month Weight Loss': 'Zealthy 6-Month Weight Loss',
    'Zealthy 12-Month Weight Loss': 'Zealthy 12-Month Weight Loss',
    'Discounted Weight Loss Plan': 'Discounted Weight Loss Plan',
    'Zealthy Weight Loss Access': 'Weight Loss Access Plan',
    'Medication Subscription': 'Medication Membership',
    'Zealthy Personalized Psychiatry': 'Personalized Psychiatry Plan',
    'Zealthy Personalized Psychiatry 3-Month':
      'Zealthy Personalized Psychiatry 3-Month Plan',
    'Zealthy Personalized Psychiatry 6-Month':
      'Zealthy Personalized Psychiatry 6-Month Plan',
    'Zealthy Personalized Psychiatry 12-Month':
      'Zealthy Personalized Psychiatry 12-Month Plan',
  };
  return names[sub];
};

export const nameToCare: { [key: string]: string } = {
  'Zealthy Weight Loss': 'weight loss care',
  'Zealthy 3-Month Weight Loss': 'weight loss care',
  'Zealthy 3-Month Weight Loss [IN]': 'weight loss care',
  'Discounted Weight Loss Plan': 'weight loss care',
  'Zealthy 6-Month Weight Loss': 'weight loss care',
  'Zealthy 12-Month Weight Loss': 'weight loss care',
  'Zealthy Weight LossAccess': 'weight loss access care',
  'Mental Health Coaching': 'mental health care',
  'Zealthy Subscription': 'Zealthy access',
  'Zealthy Personalized Psychiatry': 'mental health membership',
};

export const nameToMembership: { [key: string]: string } = {
  'Zealthy Weight Loss': 'weight loss membership',
  'Zealthy 3-Month Weight Loss': 'weight loss care',
  'Zealthy 6-Month Weight Loss': 'weight loss care',
  'Zealthy 12-Month Weight Loss': 'weight loss care',
  'Zealthy 3-Month Weight Loss [IN]': 'weight loss care',
  'Discounted Weight Loss Plan': 'weight loss membership',
  'Zealthy Weight Loss Access': 'weight loss access membership',
  'Zealthy Personalized Psychiatry': 'personalized psychiatry membership',
  'Mental Health Coaching': 'mental health membership',
  'Zealthy Subscription': 'Zealthy access',
};

export const nameToScheduleForCancelationModalText: {
  [key: string]: {
    title: string;
    description: (date: string, price?: number) => string[];
    titleOnSuccess: string;
  };
} = {
  'Zealthy Weight Loss Access': {
    title: 'Continue your weight loss access subscription?',
    description: (date: string, price?: number) => [
      `Once you confirm below, your subscription will no longer be set to expire on ${date} and will remain active.`,
      `You will need to continue your subscription to continue receiving care medication fills or refills (since your provider needs to be able to monitor throughout your treatment), to maintain access to our coordination team to help make medications more affordable, and to continue your work with your coach.`,
    ],
    titleOnSuccess:
      'Your weight loss access subscription will now remain active.',
  },
  'Zealthy Weight Loss': {
    title: 'Continue your weight loss subscription?',
    description: (date: string, price?: number) => [
      `${
        price === 297 || price === 449
          ? `Once you confirm below, your membership will no longer be set to expire on ${date} and you will be able to get refills of your ${
              price === 297 ? 'semaglutide' : 'tirzepatide'
            } medication.`
          : `Once you confirm below, your subscription will no longer be set to expire on ${date} and will remain active.`
      }`,
      `${
        price === 297 || price === 449
          ? 'Your membership will include doctor + medication (no additional cost for medication).'
          : 'You will need to continue your subscription to continue receiving care medication fills or refills (since your provider needs to be able to monitor throughout your treatment), to maintain access to our coordination team to help make medications more affordable, and to continue your work with your coach.'
      }`,
      `${
        price === 297 || price === 449
          ? 'You will need to continue your membership to get medication fills or refills (since your provider needs to be able to monitor throughout your treatment) and to maintain access to your coordination team.'
          : ''
      }`,
    ],
    titleOnSuccess: 'Your weight loss subscription will now remain active.',
  },
  'Zealthy 3-Month Weight Loss': {
    title: 'Continue your weight loss subscription?',
    description: (date: string, price?: number) => [
      `Once you confirm below, your subscription will no longer be set to expire on ${date} and will remain active.`,
      `You will need to continue your subscription to continue receiving care medication fills or refills (since your provider needs to be able to monitor throughout your treatment), to maintain access to our coordination team to help make medications more affordable, and to continue your work with your coach.`,
    ],
    titleOnSuccess: 'Your weight loss subscription will now remain active.',
  },
  'Zealthy Personalized Psychiatry': {
    title: 'Continue your subscription?',
    description: (date: string, price?: number) => [
      `Once you confirm below, your subscription will no longer be set to expire on ${date} and will remain active.`,
      `This will enable you to schedule and complete visits with an expert psychiatric provider, continue to access unlimited messaging with your psychiatric care team, and to get your psychiatric Rx delivered to your door (if prescribed).`,
    ],
    titleOnSuccess:
      'Your personalized psychiatry subscription will now remain active.',
  },
};

export const nameToCanceledModalText: {
  [key: string]: {
    title: string;
    description: () => string[];
    titleOnSuccess: string;
  };
} = {
  'Zealthy Weight Loss Access': {
    title: 'Reactivate your weight loss access subscription?',
    description: () => [
      `Once you confirm below, your Zealthy Weight Loss Access subscription will become active.`,
      `This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.`,
    ],
    titleOnSuccess:
      'Your weight loss access subscription has been reactivated.',
  },
  'Zealthy Weight Loss': {
    title: 'Reactivate your weight loss subscription?',
    description: () => [
      `Once you confirm below, your Zealthy Weight Loss subscription will become active.`,
      `This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.`,
    ],
    titleOnSuccess: 'Your weight loss subscription has been reactivated.',
  },
  'Zealthy 3-Month Weight Loss': {
    title: 'Reactivate your weight loss subscription?',
    description: () => [
      `Once you confirm below, your Zealthy Weight Loss subscription will become active.`,
      `This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.`,
    ],
    titleOnSuccess: 'Your weight loss subscription has been reactivated.',
  },
  'Zealthy Personalized Psychiatry': {
    title: 'Reactivate your personalized psychiatry membership?',
    description: () => [
      `Once you confirm below, your Zealthy Personalized Psychiatry membership will become active.`,
      `This will enable you to receive your medication shipped monthly (included in membership - no additional cost), schedule and complete visits with an expert psychiatric provider, and continue to access unlimited messaging with your psychiatric care team.`,
    ],
    titleOnSuccess:
      'Your personalized psychiatry membership has been reactivated.',
  },
};
