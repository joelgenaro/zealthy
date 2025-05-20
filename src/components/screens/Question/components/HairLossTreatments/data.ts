import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import DoublePills from '@/components/shared/icons/DoublePills';
import SprayBottle from '@/components/shared/icons/SprayBottle';
import Dropper from '@/components/shared/icons/Dropper';

type Medications = Medication & {
  delivery: string;
  description: string;
  icon: any;
};

export const drugs: Medications[] = [
  {
    name: 'Hair Restore Foam',
    type: MedicationType.HAIR_LOSS,
    quantity: 1,
    dosage: '30 ml',
    price: 120,
    discounted_price: 90,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 112,
    icon: SprayBottle,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Hair Restore Foam(Latanoprost / Finasteride) 0.01/0.1% 30 mL Foam Pump) is a compounded product (non-FDA approved) used to treat hair loss. Combining both medications has been shown to both slow hair loss and stimulate thicker hair regrowth.',
  },
  {
    name: 'Oral Minoxidil',
    type: MedicationType.HAIR_LOSS,
    quantity: 90,
    dosage: '2.5 mg',
    price: 90,
    discounted_price: 45,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 113,
    icon: DoublePills,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Oral minoxidil is most effective for people wanting to grow longer, thicker hair on their scalp.',
  },
  {
    name: 'Oral Finasteride',
    type: MedicationType.HAIR_LOSS,
    quantity: 90,
    dosage: '1 mg',
    price: 52,
    discounted_price: 26,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 52,
    icon: DoublePills,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Finasteride is a daily-use prescription pill that works by blocking the production of DHT, a hormone that causes male pattern baldness. This FDA-approved medication works best for patients wanting to reduce overall hair loss.',
  },
  // {
  //   name: "Topical Minoxidil",
  //   type: MedicationType.HAIR_LOSS,
  //   quantity: 3,
  //   dosage: "60 ml",
  //   price: 50,
  //   discounted_price: 25,
  //   recurring: {
  //     interval: "month",
  //     interval_count: 3,
  //   },
  //   medication_quantity_id: 114,
  //   icon: Dropper,
  //   delivery: "Delivered quarterly, only charged if prescribed.",
  //   description:
  //     "Topical minoxidil (5%) has been FDA-approved to slow hair loss and promote hair regrowth at the crown of the head. This option is best for patients wanting to grow thicker, longer, and more hair on the crown.",
  // },
  {
    name: 'Hair Restore Ultra Scalp Solution',
    type: MedicationType.HAIR_LOSS,
    quantity: 3,
    dosage: '30 ml',
    price: 120,
    discounted_price: 90,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 287,
    icon: Dropper,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Topical minoxidil (5%) has been FDA-approved to slow hair loss and promote hair regrowth at the crown of the head. This option is best for patients wanting to grow thicker, longer, and more hair on the crown.',
  },
];

export const addOnDrugs = [
  {
    name: 'Oral Minoxidil',
    type: MedicationType.HAIR_LOSS_ADD_ON,
    quantity: 90,
    dosage: '2.5 mg',
    price: 90,
    discounted_price: 45,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 113,
    icon: DoublePills,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Oral minoxidil is most effective for people wanting to grow longer, thicker hair on their scalp.',
  },
  {
    name: 'Oral Finasteride',
    type: MedicationType.HAIR_LOSS_ADD_ON,
    quantity: 90,
    dosage: '1 mg',
    price: 52,
    discounted_price: 26,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 52,
    icon: DoublePills,
    delivery: 'Delivered quarterly, only charged if prescribed.',
    description:
      'Finasteride is a daily-use prescription pill that works by blocking the production of DHT, a hormone that causes male pattern baldness. This FDA-approved medication works best for patients wanting to reduce overall hair loss.',
  },
];
