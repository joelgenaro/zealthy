import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';

export type Offer = {
  header: string;
  subHeaders: string[];
  body1: string;
  body2?: string;
  buttonText?: string;
};

export const insuranceToAdd: {
  [key in PotentialInsuranceOption]: Offer;
} = {
  Default: {
    header: 'Limited Time Offer:',
    subHeaders: [
      'No access fee for first 3 months for Florida insurance members',
    ],
    body1:
      'We provide in-network care for Florida insurance members 100% online. Same-day appointments, unlimited messaging with your care team, medication delivery, and more.',
  },
  BCIL: {
    header: 'Limited Time Offer:',
    subHeaders: [
      'Blue Cross Illinois members get doctor’s visit for as little as $0',
    ],
    body1:
      'Zealthy offers care for Blue Cross of Illinois members, including doctor’s visits, messaging with your provider or coordinator, and prescription medication (if medically appropriate).',
  },
  TX: {
    header: 'Limited Time Offer:',
    subHeaders: ['$70 off first month of Zealthy Weight Loss Program'],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  OH: {
    header: 'Limited Time Offer:',
    subHeaders: ['$141 off your first 3 months of Zealthy Weight Loss Program'],
    body1: 'Claim this one-time offer and begin losing weight right away',
  },
  Aetna: {
    header: 'Limited Time Offer:',
    subHeaders: ['No access fee for first 3 months for Aetna Florida members'],
    body1:
      'We provide in-network care for Aetna Florida members 100% online. Same-day appointments, unlimited messaging with your care team, medication delivery, and more.',
  },
  OON: {
    header: 'Limited Time Offer:',
    subHeaders: ['Get your Zealthy doctor’s visit for as little as $0'],
    body1:
      'Zealthy offers care with or without insurance, including doctor’s visits, messaging with your provider or coordinator, and prescription medication (if medically appropriate).',
  },
  OON2: {
    header:
      'Complete video visit with a Zealthy doctor. Get diagnosed and prescribed Rx.',
    subHeaders: [''],
    body1:
      'Zealthy offers care with or without insurance, including doctor’s visits, messaging with your provider or coordinator, and prescription medication (if medically appropriate).',
    buttonText: 'Continue',
  },
  Medicare: { header: '', subHeaders: [], body1: '' },
  'Medicare Access Florida': {
    header: 'Limited Time Offer:',
    subHeaders: [
      'Just $39 for your first month of Z-Plan, Zealthy’s Access Only Program for Medicare Members',
    ],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  'Medicaid Access Florida': {
    header: 'Limited Time Offer:',
    subHeaders: [
      'Just $39 for your first month of Z-Plan, Zealthy’s Access Only Program for Medicaid Members',
    ],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  'Semaglutide Bundled': {
    header: 'Limited Time Offer: ',
    subHeaders: [
      'Sign up today and lock in your weight loss care, including semaglutide to your door.',
    ],
    body1:
      'Claim this one time offer and begin losing weight right away. Semaglutide is the main active ingredient in Wegovy® and Ozempic®.',
  },
  'Semaglutide Bundled Oral Pills': {
    header: 'Limited Time Offer: ',
    subHeaders: [
      'Sign up today and lock in your weight loss care, including semaglutide to your door.',
    ],
    body1:
      'Claim this one time offer and begin losing weight right away. Semaglutide is the main active ingredient in Wegovy® and Ozempic®.',
  },
  'Tirzepatide Bundled': {
    header: 'Limited Time Offer:',
    subHeaders: [
      'Sign up today and lock in your weight loss care, including tirzepatide to your door.',
    ],
    body1:
      'Claim this one time offer and begin losing weight right away. Tirzepatide is the main active ingredient in Mounjaro® and Zepbound™.',
  },
  'Weight Loss Sync': {
    header: 'Limited Time Offer:',
    subHeaders: ['$96 off first month of Zealthy Weight Loss Program!'],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  'First Month Free': {
    header: 'Limited Time Offer:',
    subHeaders: ['First Month Free!'],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
  Hardies: {
    header: '',
    subHeaders: [],
    body1: '',
  },
  'Additional PA': {
    header: '',
    subHeaders: [],
    body1: '',
  },
  'Mental Health Refill Request': {
    header: '',
    subHeaders: [],
    body1: '',
  },
  'Weight Loss Continue': {
    header: '',
    subHeaders: [],
    body1: '',
  },
};
