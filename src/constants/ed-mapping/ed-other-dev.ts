const optionsDev = [
  {
    quantity: 30,
    price: 135,
    discounted_price: 115,
    medication_quantity_id: 182,
    label: 'Monthly',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
  },
  {
    quantity: 90,
    price: 180,
    discounted_price: 160,
    medication_quantity_id: 36,
    label: 'Every 3 months',
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
  },
  {
    quantity: 360,
    price: 648,
    discounted_price: 628,
    medication_quantity_id: 183,
    label: 'Every 12 Months',
    recurring: {
      interval: 'month',
      interval_count: 12,
    },
  },
];

const cialisOptionsDev = [
  {
    quantity: 30,
    price: 1045,
    discounted_price: 1025,
    medication_quantity_id: 184,
    label: 'Monthly',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
  },
  {
    quantity: 90,
    price: 2964,
    discounted_price: 2944,
    medication_quantity_id: 185,
    label: 'Every 3 months',
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
  },
  {
    quantity: 360,
    price: 11484,
    discounted_price: 11464,
    medication_quantity_id: 186,
    label: 'Every 12 Months',
    recurring: {
      interval: 'month',
      interval_count: 12,
    },
  },
];

export const dailyOptions = {
  'Cialis, Daily': cialisOptionsDev,
  'Tadalafil (Generic Cialis), Daily': optionsDev,
};
