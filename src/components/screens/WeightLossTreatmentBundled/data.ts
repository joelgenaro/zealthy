export const medications = [
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
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
      'The monthly cost of this medication can be as low as $151 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
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
      'The monthly cost of this medication can be as low as $216 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
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
    sixWeekPrice?: number;
    title: string;
    singleTitle: string;
    dosage: string;
    dosageCA?: string;
    singleDosage: string;
    singleDosageCA?: string;
    name: string;
    body1: string;
    body2?: string;
  };
} = {
  Semaglutide: {
    saving: 148,
    price: 297,
    discountedPrice: 223,
    sixWeekPrice: 275,
    title:
      'Get 3 month supply of Semaglutide + next 2 months of doctor & coaching',
    singleTitle: 'Get 1 month supply of medication',
    dosage: '10 mg vial',
    dosageCA: '10 mg',
    singleDosage: '1 mg vial',
    singleDosageCA: '2.5 mg',
    name: 'Semaglutide',
    body1:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership upfront.',
  },
  Tirzepatide: {
    saving: 180,
    price: 449,
    discountedPrice: 359,
    title:
      'Get 3 month supply of Tirzepatide + next 2 months of doctor & coaching',
    singleTitle: 'Get 1 month supply of medication',
    dosage: '50 mg vial',
    dosageCA: '60 mg',
    singleDosage: '10 mg vial',
    singleDosageCA: '10 mg',
    name: 'Tirzepatide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
  },
  Liraglutide: {
    saving: 279,
    price: 375,
    discountedPrice: 300,
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '90 mg vial',
    singleDosage: '50 mg vial',
    name: 'Liraglutide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2:
      'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
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
  Wegovy: {
    title: 'Wegovy (semaglutide)',
    overview:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    results:
      'Most patients who use Wegovy will lose 15% of their body weight over a year.',
    cost: [
      `Potentially covered by insurance. With insurance and savings card, as low as $0 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.`,
      `Wegovy is typically the most affordable GLP-1 option for those with insurance.`,
    ],
  },
  Semaglutide: {
    title: 'Semaglutide',
    overview:
      'Semaglutide is the generic name for Ozempic and Wegovy, GLP-1 medications that are FDA-approved for treatment of type 2 diabetes and weight loss respectively. \n\nAs a Zealthy Weight Loss member, you have access to a compounded form of Semaglutide if prescribed. Compounded Semaglutide contains the same active ingredient as the commercially available medications Ozempic and Wegovy.*',
    results:
      'Studies have shown that once weekly Semaglutide injections led to 14.9% of body weight loss on average over 68 weeks.**',
    cost: [
      'As a Zealthy member, the cost of the medication is as little as $151/month, and approximately the same price or slightly more if your dose increases for future months. This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home at no additional cost.',
    ],
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  Tirzepatide: {
    title: 'Tirzepatide',
    overview:
      'Tirzepatide is the generic name for Mounjaro and Zepbound, GLP-1 medications that are FDA-approved for treatment of type 2 diabetes and weight loss respecively.\n\nAs a Zealthy Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed. Compounded Tirzepatide contains the same active ingredient as the commercially available medications Mounjaro and Zepbound.*',
    results:
      'Studies have shown that once weekly Tirzepatide injections led to 20% of body weight loss on average over 72 weeks.**',
    cost: [
      'As a Zealthy member, the cost of the medication is as little as $216/month, and approximately the same price or slightly more if your dose increases for future months. This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization.  Your medication would be shipped to your home, which is included in the price.',
    ],
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  Liraglutide: {
    title: 'Liraglutide',
    overview:
      'Liraglutide has been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use liraglutide will lose 8% of their body weight over a year.',
    cost: [
      'The cost of the medication for most users will be $375/month and will be paid out of pocket. This option is due to a unique pharmacy partnership we have and does not require use of insurance or prior authorization.  Your medication would be shipped to your home.',
    ],
  },
};
