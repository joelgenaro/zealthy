import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';

type Medications = Medication & {
  delivery: string;
  description: string;
};

export const drugs: Medications[] = [
  {
    name: 'Minoxidil',
    type: MedicationType.FEMALE_HAIR_LOSS,
    quantity: 90,
    dosage: '2.5 mg',
    price: 240,
    discounted_price: 147,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 113,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Oral minoxidil is most effective for people wanting to grow longer, thicker hair on their scalp.',
  },
  {
    name: 'Hair Strengthen Foam',
    type: MedicationType.FEMALE_HAIR_LOSS,
    quantity: 3,
    dosage: '30 ml',
    price: 300,
    discounted_price: 270,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 429 : 389,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Hair Strengthen Foam estrengthens and regrows hair by using this daily.',
  },
  {
    name: 'Hair Restore Solution',
    type: MedicationType.FEMALE_HAIR_LOSS,
    quantity: 3,
    dosage: '60 ml',
    price: 300,
    discounted_price: 270,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 427 : 387,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Hair restore solution is a form of topical minoxidil that is known for helping regrow hair.',
  },
];
