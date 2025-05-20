import { OptionType } from './types';

export type SubscriptionType = 'weight loss' | 'personalized psychiatry';

export const getOptions = (
  basePath: string,
  isVariation1?: boolean
): { [key in SubscriptionType]: OptionType[] } => ({
  'weight loss': [
    {
      popular: false,
      header: 'Zealthy 3-Month Weight Loss Plan',
      subHeader: 'SAVE 15%',
      body: '$339.00 billed every 3 months',
      path: basePath,
      interval: 3,
      type: 'weight loss',
    },
    {
      popular: false,
      header: 'Zealthy 6-Month Weight Loss Plan',
      subHeader: 'SAVE 27%',
      body: '$599.00 billed every 6 months',
      path: basePath,
      interval: 6,
      type: 'weight loss',
    },
    {
      popular: false,
      header: 'Zealthy 12-Month Weight Loss Plan',
      subHeader: 'SAVE 33%',
      body: '$1,099.00 billed every 12 months',
      path: basePath,
      interval: 12,
      type: 'weight loss',
    },
  ],
  'personalized psychiatry': [
    {
      popular: false,
      header: 'Zealthy Personalized Psychiatry 3-Month Plan',
      subHeader: 'Save 15%',
      body: '$252.45 billed every 3 months',
      path: basePath,
      interval: 3,
      type: 'personalized psychiatry',
    },
    {
      popular: true,
      header: 'Zealthy Personalized Psychiatry 6-Month Plan',
      subHeader: 'Save 25%',
      body: '$445.50 billed every 6 months',
      path: basePath,
      interval: 6,
      type: 'personalized psychiatry',
    },
    {
      popular: false,
      header: 'Zealthy Personalized Psychiatry 12-Month Plan',
      subHeader: 'Save 34%',
      body: '$784.00 billed every 12 months',
      path: basePath,
      interval: 12,
      type: 'personalized psychiatry',
    },
  ],
});

export const bodyMap = {
  'weight loss':
    'Commit to a long-term change and save when you purchase up to one year of Zealthy Weight Loss today. Your upgrade will start after your current billing period.',
  'personalized psychiatry':
    'Commit to a long-term change and save when you purchase up to one year of Zealthy Personalized Psychiatry today. Your upgrade will start after your current billing period.',
};
