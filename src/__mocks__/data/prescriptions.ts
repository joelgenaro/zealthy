import { IPrescription } from '@/types/prescription';

const prescriptions: IPrescription[] = [
  {
    id: 1,
    product_name: 'Amoxicillin',
    price: 15,
    currency: 'USD',
    status: 'active',
    refills: 5,
    schedule: 'month',
    unit: 'capsule',
    quantity: 30,
    dosage: '50 mg orally, every 8 hours',
  },
  {
    id: 2,
    product_name: 'Hydroxychloroquine',
    price: 20,
    currency: 'USD',
    status: 'active',
    refills: 3,
    schedule: 'month',
    unit: 'capsule',
    quantity: 30,
    dosage: '160 mg orally, 3 times a day for 28 days',
  },
  {
    id: 3,
    product_name: 'Methotrexate',
    price: 30,
    currency: 'USD',
    status: 'active',
    refills: 1,
    schedule: 'month',
    unit: 'capsule',
    quantity: 30,
    dosage: '500 mg orally, 3 times a day',
  },
];

export default prescriptions;
