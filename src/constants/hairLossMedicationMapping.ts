import { StaticImageData } from 'next/image';
import DoublePills from '@/components/shared/icons/DoublePills';
import Dropper from '@/components/shared/icons/Dropper';
import FoamBottleImage from 'public/images/foam-bottle.png';
import GelBottleImage from 'public/images/gel-bottle.png';
import SmallBottle from 'public/images/bottle.png';
import BottleWithFoam from '@/components/shared/icons/BottleWithFoam';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import HandFoam from '@/components/shared/icons/HandFoam';

export type Combination = {
  Icon: ({ props }: any) => JSX.Element;
  displayName: string;
  price: number;
  discountedPrice: number;
  interval: string;
  description: string;
  discount: string;
  images: StaticImageData[];
  height: number[];
};

export const combinations: { [key: string]: Combination } = {
  'Oral Minoxidil and Oral Finasteride': {
    Icon: DoublePills,
    displayName: 'Oral Minoxidil and Oral Finasteride Combo',
    price: 170,
    discountedPrice: 113.33,
    interval: '3 Month Supply',
    description:
      'This treatment plan will help regrowth of thicker, stronger hair. Taking the medication daily helps prevent future hair loss.',
    discount: 'Get your first month free',
    images: [SmallBottle, SmallBottle],
    height: [200, 200],
  },
  'Oral Finasteride and Minoxidil Foam': {
    Icon: Dropper,
    displayName: 'Minoxidil Foam and Oral Finasteride',
    price: 130,
    discountedPrice: 86.66,
    interval: '3 Month Supply',
    description:
      'This treatment plan will help hair regrowth and prevent future hair loss. This treatment plan is FDA-approved.',
    discount: 'Get your first month free',
    images: [SmallBottle, FoamBottleImage],
    height: [200, 300],
  },
  'Topical Finasteride and Minoxidil Gel': {
    Icon: HandFoam,
    displayName: 'Topical Finasteride and Minoxidil Gel',
    price: 180,
    discountedPrice: 120,
    interval: '3 Month Supply(90 ml)',
    description:
      'This prescription hair loss treatment plan will help hair regrowth and prevent future hair loss.',
    discount: 'Get your first month free',
    images: [GelBottleImage],
    height: [300],
  },
  'Oral Minoxidil': {
    Icon: DoublePills,
    displayName: 'Oral Minoxidil',
    price: 90,
    discountedPrice: 60,
    interval: '3 Month Supply (90 x 2.5 mg)',
    description:
      'Oral minoxidil is most effective for people wanting to grow longer, thicker hair on their scalp.',
    discount: 'Get your first month free',
    images: [SmallBottle],
    height: [200],
  },
  'Oral Finasteride': {
    Icon: DoublePills,
    displayName: 'Oral Finasteride',
    price: 80,
    discountedPrice: 53.33,
    interval: '3 Month Supply (90 x 1 mg)',
    description:
      'Finasteride is a daily-use prescription pill that works by blocking the production of DHT, a hormone that causes male pattern baldness. This FDA-approved medication works best for patients wanting to reduce overall hair loss.',
    discount: 'Get your first month free',
    images: [SmallBottle],
    height: [200],
  },
  'Minoxidil Foam': {
    Icon: BottleWithFoam,
    displayName: 'Minoxidil Foam',
    price: 50,
    discountedPrice: 33.33,
    interval: '3 Month Supply',
    description:
      'Minoxidil foam is a topical treatment and best for growing thicker and more hair. It’s a FDA-approved topical solution and if used regularly will help hair regrowth in as early as 2-4 months.',
    images: [FoamBottleImage],
    discount: 'Get your first month free',
    height: [200],
  },
};

export const hairLossMedication: { [key: string]: Medication } = {
  'Oral Minoxidil': {
    name: 'Oral Minoxidil',
    type: MedicationType.HAIR_LOSS,
    quantity: 90,
    dosage: '2.5 mg',
    price: 90,
    discounted_price: 60,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 113,
  },
  'Oral Finasteride': {
    name: 'Oral Finasteride',
    type: MedicationType.HAIR_LOSS,
    quantity: 90,
    dosage: '1 mg',
    price: 80,
    discounted_price: 53.33,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 52,
  },
  'Minoxidil Foam': {
    name: 'Minoxidil Foam',
    type: MedicationType.HAIR_LOSS,
    quantity: 3,
    dosage: '60 ml',
    price: 50,
    discounted_price: 33.33,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 114,
  },
  'Topical Finasteride and Minoxidil Gel': {
    name: 'Topical Finasteride and Minoxidil Gel',
    type: MedicationType.HAIR_LOSS,
    quantity: 1,
    dosage: '90 ml',
    price: 180,
    discounted_price: 120,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 112,
  },
};

export const hairLossMedication6month: { [key: string]: Medication } = {
  'Oral Minoxidil': {
    name: 'Oral Minoxidil',
    type: MedicationType.HAIR_LOSS,
    quantity: 90,
    dosage: '2.5 mg',
    price: 150,
    discounted_price: 132,
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
    medication_quantity_id: 113,
  },
  'Oral Finasteride': {
    name: 'Oral Finasteride',
    type: MedicationType.HAIR_LOSS,
    quantity: 90,
    dosage: '1 mg',
    price: 138.33,
    discounted_price: 123,
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
    medication_quantity_id: 52,
  },
  'Minoxidil Foam': {
    name: 'Minoxidil Foam',
    type: MedicationType.HAIR_LOSS,
    quantity: 3,
    dosage: '60 ml',
    price: 83.33,
    discounted_price: 70.8,
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
    medication_quantity_id: 114,
  },
  'Topical Finasteride and Minoxidil Gel': {
    name: 'Topical Finasteride and Minoxidil Gel',
    type: MedicationType.HAIR_LOSS,
    quantity: 1,
    dosage: '90 ml',
    price: 180,
    discounted_price: 120,
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
    medication_quantity_id: 112,
  },
};
