import { MedicationType } from '@/context/AppContext/reducers/types/visit';

type MedObjectProps = {
  name: string;
  type: MedicationType;
  price: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
};

export const medications = [
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Rybelsus',
    drug: 'Semaglutide',
    body1:
      'Rybelsus (semaglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Rybelsus will lose 5 to 10% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];
export const compoundMedications = [
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2:
      'As a Zealthy weight loss member we offer access to a compounded form of Semaglutide if prescribed**.',
    body3:
      'Your first month of semaglutide is generally around $151. This may vary based on dosage.',
    disclaimers: [
      '*Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
      '**When used in combination with a restricted calorie diet and exercise program',
    ],
  },
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2:
      'As a Zealthy Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. ',
    body3:
      'Your first month of Tirzepatide is generally around $200. This may vary based on dosage.',
    disclaimers: [
      '*Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
      '**When used in combination with a restricted calorie diet and exercise program',
    ],
  },
];
export const compoundMedicationsCA = [
  {
    brand: 'Liraglutide',
    drug: '',
    body1:
      'Liraglutide has been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Liraglutide will lose 8% of their body weight over a year.',
    body3: '',
  },
];
export const compoundDetails: {
  [key: string]: {
    saving: number;
    price: number;
    discountedPrice: number;
    ohioTitle: string;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    singleDescription: string;
    name: string;
    body1: string;
    body2: string;
    medData: MedObjectProps;
    medBulkData: MedObjectProps;
  };
} = {
  Semaglutide: {
    saving: 104,
    price: 125,
    discountedPrice: 100,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '10 mg vial [5mg/mL x 2mL]',
    singleDosage: '1 mg vial [1mg/mL x 1 mL]',
    singleDescription: '$125 for your first month of Semaglutide',
    name: 'Semaglutide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
    medData: {
      name: 'Semaglutide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 125,
      dosage: '1 mg vial (1 mg/mL x 1 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
    medBulkData: {
      name: 'Semaglutide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 125,
      discounted_price: 100,
      dosage: '10 mg vial (5 mg/mL x 2 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
  },
  Tirzepatide: {
    saving: 175,
    price: 200,
    discountedPrice: 160,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '30 mg vial [10mg/mL x 3mL]',
    singleDosage: '10 mg vial [10mg/mL x 1 mL]',
    singleDescription: '$200 for your first month of Tirzepatide',
    name: 'Tirzepatide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
    medData: {
      name: 'Tirzepatide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 200,
      dosage: '10 mg vial (5 mg/.5 mL x 1mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
    medBulkData: {
      name: 'Tirzepatide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 200,
      discounted_price: 160,
      dosage: '30 mg vial (10 mg/mL x 3 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
  },
  Liraglutide: {
    saving: 84,
    price: 375,
    discountedPrice: 360,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '90 mg vial',
    singleDosage: '50 mg vial [10mg/mL x 5 mL]',
    singleDescription: '$375 for your first month of Liraglutide',
    name: 'Liraglutide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
    medData: {
      name: 'Liraglutide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 375,
      dosage: '50 mg vial (10 mg/mL X 5 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
    medBulkData: {
      name: 'Liraglutide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 375,
      discounted_price: 360,
      dosage: '90 mg vial',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
  },
};

export const compoundMonthTwoDetails: {
  [key: string]: {
    saving: number;
    price: number;
    discountedPrice: number;
    ohioTitle: string;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    singleDescription: string;
    name: string;
    body1: string;
    body2: string;
    medData: MedObjectProps;
    medBulkData: MedObjectProps;
  };
} = {
  Semaglutide: {
    saving: 489,
    price: 275,
    discountedPrice: 130,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '10 mg vial [5mg/mL x 2mL]',
    singleDosage: '2 mg vial [2mg/mL x 1 mL]',
    singleDescription: '$275 for your next month of Semaglutide',
    name: 'Semaglutide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
    medData: {
      name: 'Semaglutide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 275,
      dosage: '2 mg vial (2 mg/mL x 1 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
    medBulkData: {
      name: 'Semaglutide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 162,
      discounted_price: 130,
      dosage: '10 mg vial (5 mg/mL x 2 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
  },
  Tirzepatide: {
    saving: 333,
    price: 360,
    discountedPrice: 267,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '50 mg vial [10mg/mL x 5mL]',
    singleDosage: '20 mg vial [10mg/mL x 2 mL]',
    singleDescription: '$360 for your next month of Tirzepatide',
    name: 'Tirzepatide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
    medData: {
      name: 'Tirzepatide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 360,
      dosage: '20 mg vial (10 mg/mL x 2mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
    medBulkData: {
      name: 'Tirzepatide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 360,
      discounted_price: 267,
      dosage: '50 mg vial (10 mg/mL x 5 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
  },
};

export const compoundMonthThreeDetails: {
  [key: string]: {
    saving: number;
    price: number;
    discountedPrice: number;
    ohioTitle: string;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    singleDescription: string;
    name: string;
    body1: string;
    body2: string;
    medData: MedObjectProps;
    medBulkData: MedObjectProps;
  };
} = {
  Semaglutide: {
    saving: 489,
    price: 275,
    discountedPrice: 130,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '10 mg vial [5mg/mL x 2mL]',
    singleDosage: '5 mg vial [5mg/mL x 1 mL]',
    singleDescription: '$275 for your next month of Semaglutide',
    name: 'Semaglutide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
    medData: {
      name: 'Semaglutide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 275,
      dosage: '5 mg vial (5 mg/mL x 1 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
    medBulkData: {
      name: 'Semaglutide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 162,
      discounted_price: 130,
      dosage: '10 mg vial (5 mg/mL x 2 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
  },
  Tirzepatide: {
    saving: 333,
    price: 360,
    discountedPrice: 267,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '50 mg vial [10mg/mL x 5mL]',
    singleDosage: '20 mg vial [10mg/mL x 2 mL]',
    singleDescription: '$360 for your next month of Tirzepatide',
    name: 'Tirzepatide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
    medData: {
      name: 'Tirzepatide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 360,
      dosage: '20 mg vial (10 mg/mL x 2mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
    medBulkData: {
      name: 'Tirzepatide weekly injections',
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: 360,
      discounted_price: 267,
      dosage: '50 mg vial (10 mg/mL x 5 mL)',
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 0,
      },
      medication_quantity_id: 98,
    },
  },
};

export const details: {
  [key: string]: {
    title: string;
    overview: string;
    results: string;
    cost: string[];
    disclaimers?: string[];
  };
} = {
  Ozempic: {
    title: 'Ozempic (semaglutide)',
    overview:
      'A GLP-1 medication effective for weight loss when used off-label; FDA-approved for type 2 diabetes in 2017.',
    results:
      'Most patients who use Ozempic will lose 15% of their body weight over a year.',
    cost: [
      'If your insurance covers Ozempic, it will likely cost $25 per month. The manufacturer, Novo Nordisk, has a savings card that typically lowers your copay to $25 per month if your insurance covers the medication, with a maximum saving of $150 per 1 month prescription.',
    ],
  },
  Wegovy: {
    title: 'Wegovy (semaglutide)',
    overview:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    results:
      'Most patients who use Wegovy will lose 15% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $0 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
      'Wegovy is typically the most affordable GLP-1 option for those with insurance.',
    ],
  },
  Mounjaro: {
    title: 'Mounjaro (tirzepatide)',
    overview:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Mounjaro will lose 20% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $25 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
    ],
  },
  Saxenda: {
    title: 'Saxenda (liraglutide)',
    overview:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014. ',
    results:
      'Most patients who use Saxenda will lose 8% of their body weight over a year.',
    cost: [
      'If your insurance covers Saxenda, the manufacturer, Novo Nordisk, has a saving card that can reduce your out-of-pocket cost to as little as $25. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
    ],
  },
  Rybelsus: {
    title: 'Rybelsus (semaglutide)',
    overview:
      'Rybelsus (semaglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Rybelsus will lose 5 to 10% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $10 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
    ],
  },
  Victoza: {
    title: 'Victoza (liraglutide)',
    overview:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $20 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
    ],
  },
  Metformin: {
    title: 'Metformin',
    overview:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
    cost: [
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    ],
  },
  Semaglutide: {
    title: 'Semaglutide',
    overview:
      'Semaglutide is the generic name for Ozempic and Wegovy, GLP-1 medications that are FDA-approved for treatment of type 2 diabetes and weight loss respectively. \n\nAs a Zealthy Weight Loss member, you have access to a compounded form of Semaglutide if prescribed. Compounded Semaglutide contains the same active ingredient as the commercially available medications Ozempic and Wegovy.*',
    results:
      'Studies have shown that once weekly Semaglutide injections led to 14.9% of body weight loss on average over 68 weeks.**',
    cost: [
      'The cost of the medication for most users will be $151/month and will be paid out of pocket. This option is due to a unique pharmacy partnership we have and does not require use of insurance or prior authorization. Your medication would be shipped to your home.',
    ],
    disclaimers: [
      '*Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
      '**When used in combination with a restricted calorie diet and exercise program',
    ],
  },
  Liraglutide: {
    title: 'Liraglutide',
    overview:
      'Liraglutide has been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Liraglutide will lose 8% of their body weight over a year.',
    cost: [
      'The cost of the medication for most users will be $375/month and will be paid out of pocket. This option is due to a unique pharmacy partnership we have and does not require use of insurance or prior authorization.  Your medication would be shipped to your home.',
    ],
  },
  Tirzepatide: {
    title: 'Tirzepatide',
    overview:
      'Tirzepatide is the generic name for Mounjaro and Zepbound, GLP-1 medications that are FDA-approved for treatment of type 2 diabetes and weight loss respecively.\n\nAs a Zealthy Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed. Compounded Tirzepatide contains the same active ingredient as the commercially available medications Mounjaro and Zepbound.*',
    results:
      'Studies have shown that once weekly Tirzepatide injections led to 20% of body weight loss on average over 72 weeks.**',
    cost: [
      'The cost of the medication for most users will be $300 for your first month, and approximately the same price or slightly more if your dose increases for future months. This option, which is significantly more affordable than alternatives, is due to a unique pharmacy partnership we have and does not require use of insurance or prior authorization.  Your medication would be shipped to your home.',
    ],
    disclaimers: [
      '*Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
      '**When used in combination with a restricted calorie diet and exercise program',
    ],
  },
};
