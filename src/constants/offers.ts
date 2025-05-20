import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import getConfig from '../../config';

export type Offer = {
  header: string;
  subHeaders: string[];
  body1: string;
  body2?: string;
  buttonText?: string;
};

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

export const careToOffer: {
  [key in SpecificCareOption]: Offer;
} = {
  'Weight loss': {
    header: 'Limited Time Offer:',
    subHeaders: [`$96 off first month of ${siteName} Weight Loss Program!`],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  'Weight loss ad': {
    header: 'Limited Time Offer:',
    subHeaders: [`$96 off first month of ${siteName} Weight Loss Program!`],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  'Weight loss access': {
    header: 'Limited Time Offer:',
    subHeaders: [`$96 off first month of ${siteName} Weight Loss Program!`],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  'Weight loss access v2': {
    header: 'Limited Time Offer:',
    subHeaders: [`$96 off first month of ${siteName} Weight Loss Program!`],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  'Birth control': {
    header: 'Limited Time Offer:',
    subHeaders: ['Free medical provider review of birth control request'],
    body1:
      'Claim this one-time offer and start getting your birth control delivered to your home in discreet packaging.',
    body2: '',
  },
  'Erectile dysfunction': {
    header: 'Limited Time Offer:',
    subHeaders: ['$20 off first order'],
    body1:
      'Begin your erectile dysfunction visit. 100% online and no appointment needed.',
  },
  'Hair loss': {
    header: 'Limited Time Offer:',
    subHeaders: ['50% off first 3 months of hair loss treatment'],
    body1: '100% online and no appointment needed. Delivery included.',
  },
  'Hair Loss': {
    header: 'Limited Time Offer:',
    subHeaders: ['50% off first 3 months of hair loss treatment'],
    body1: '100% online and no appointment needed. Delivery included.',
  },
  'Anxiety or depression': {
    header: 'Limited Time Offer:',
    subHeaders: [`70% off expert psychiatry + medication at ${siteName}`],
    body1:
      'Continue to create your account and complete our free emotional assessment to see if we can help.',
  },
  'Mental health': {
    header: 'Limited Time Offer:',
    subHeaders: ['20% off your first order'],
    body1:
      'Continue to create your account and complete our free emotional assessment. If you sign up today and receive medication, you will get 20% off your first order.',
  },
  'Primary care': {
    header: 'Limited Time Offer:',
    subHeaders: [`Your first 3 months of ${siteName} membership are free!`],
    body1: `Claim this one-time offer and start getting healthy with ${siteName} today for as little as $0.`,
    body2: '$30 every 3 months thereafter',
  },
  'Virtual Urgent Care': {
    header: 'Limited Time Offer:',
    subHeaders: [`Your first 3 months of ${siteName} membership are free!`],
    body1: `Claim this one-time offer and start getting healthy with ${siteName} today for as little as $0.`,
    body2: '$30 every 3 months thereafter',
  },
  Acne: {
    header: 'Limited time:',
    subHeaders: ['Only $20 to sign up and get clear skin soon'],
    body1: 'Claim this one-time offer and get clear skin within weeks.',
  },
  'Fine Lines & Wrinkles': {
    header: 'Limited Time:',
    subHeaders: ['Only $20 to sign up and for smoother, younger looking skin'],
    body1: '',
  },
  'Hyperpigmentation Dark Spots': {
    header: 'Limited Time:',
    subHeaders: [
      'Only $20 to sign up and reduce hyperpigmentation within weeks',
    ],
    body1: 'Claim this one-time offer and get better skin within weeks.',
  },
  Rosacea: {
    header: 'Limited Time:',
    subHeaders: [
      'Only $20 to sign up and clear redness or inflamed bumps from rosacea',
    ],
    body1: 'Claim this one-time offer and get clear skin within weeks.',
  },
  Skincare: {
    header: 'Limited Time:',
    subHeaders: ['Only $20 for your online dermatology visit'],
    body1:
      'After setting up your account you can start your intake, securely message with your dermatology provider, and get your customized treatment plan.',
  },
  Enclomiphene: {
    header: 'You came to the right place',
    subHeaders: [],
    body1:
      '68% of men report better energy, happiness, sexual function, work & athletic performance, while on enclomiphene',
    buttonText: 'Continue',
  },
  Preworkout: {
    header: '',
    subHeaders: [],
    body1: '',
    buttonText: 'Continue',
  },
  Prep: {
    header: 'Limited Time Offer: Free PrEP delivery',
    subHeaders: [],
    body1:
      'Claim this one-time offer and start getting your PrEP delivered to your home in discreet packaging.',
    buttonText: 'Continue with my offer',
  },
  Sleep: {
    header:
      'Limited Time Offer: Get up to 45% off on FDA approved sleep medication',
    subHeaders: [],
    body1: '',
    buttonText: 'Continue with my offer',
  },
  'Sex + Hair': {
    header: 'Limited Time: 10% Off First Purchase',
    subHeaders: [],
    body1: '',
    buttonText: 'Continue',
  },
  'Weight Loss Free Consult': {
    header:
      'Limited Time Offer: Get up to 45% off on FDA approved sleep medication',
    subHeaders: [],
    body1: '',
    buttonText: 'Continue with my offer',
  },
  Menopause: {
    header: '',
    subHeaders: [],
    body1: '',
    buttonText: 'Continue',
  },
  Default: {
    header: 'Limited Time Offer:',
    subHeaders: [`Your first 3 months of ${siteName} membership are free!`],
    body1: `Claim this one-time offer and start getting healthy with ${siteName} today for as little as $0.`,
    body2: '$30 every 3 months thereafter',
  },
  Other: {
    header: 'Limited Time Offer:',
    subHeaders: [`Your first 3 months of ${siteName} membership are free!`],
    body1: `Claim this one-time offer and start getting healthy with ${siteName} today for as little as $0.`,
    body2: '$30 every 3 months thereafter',
  },
};
