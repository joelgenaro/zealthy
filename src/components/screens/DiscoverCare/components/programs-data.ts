import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import semaglutide from '/public/images/trending/trending1.png';
import tirzepatide from '/public/images/trending/trending2.png';
import { PatientProps } from '@/components/hooks/data';
import { StaticImageData } from 'next/image';

type ProgramContentData = {
  isIntro: boolean;
  intro?: string;
  header?: string;
  subheader?: string;
  image?: StaticImageData | string;
  bgImage?: string;
  buttonColor?: string;
  isBottle?: boolean;
  specificCare: SpecificCareOption;
  potentialInsurance?: PotentialInsuranceOption;
  path?: string;
  isWeightLoss?: boolean;
  isMH?: boolean;
  // if this array is set, then only include the program if the patient's region is in this array
  includeRegions?: string[];
  // if this array is set, then exclude the program if the patient's region is in this array
  excludeRegions?: string[];
};

export const weightLossPrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'Weight loss with a plan',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/weight-loss-bg.svg',
    specificCare: SpecificCareOption.WEIGHT_LOSS,
    path: '/patient-portal/weight-loss-treatment/compound',
    isWeightLoss: true,
  },
  {
    isIntro: false,
    header: 'Semaglutide',
    isBottle: true,
    image: semaglutide,
    specificCare: SpecificCareOption.WEIGHT_LOSS,
    path: '/patient-portal/weight-loss-treatment/compound',
    isWeightLoss: true,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Tirzepatide',
    image: tirzepatide,
    specificCare: SpecificCareOption.WEIGHT_LOSS,
    path: '/patient-portal/weight-loss-treatment/compound',
    isWeightLoss: true,
  },
];

export const edPrograms = (patient: PatientProps): ProgramContentData[] => {
  // all possible ED programs before filtering on region
  const allEdPrograms: ProgramContentData[] = [
    {
      isIntro: true,
      intro: "Don't let ED stop you",
      buttonColor: '#ffffff',
      bgImage:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/ed-program.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
    },
    {
      isIntro: false,
      // isBottle: true,
      header: 'Sildenafil + Tadalafil Zealthy Hardies',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/green_hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      excludeRegions: ['CA'],
    },
    {
      isIntro: false,
      header: 'Tadalafil + Vardenafil Zealthy Hardies',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      excludeRegions: ['CA'],
    },
    {
      isIntro: false,
      header: 'Sildenafil + Oxytocin Zealthy Hardies',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/white-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      excludeRegions: ['CA'],
    },
    {
      isIntro: false,
      header: 'Tadalafil + Oxytocin Zealthy Hardies',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+o-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      excludeRegions: ['CA'],
    },
    {
      isIntro: false,
      header: 'Sildenafil Hardies',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/dark-blue-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      includeRegions: ['CA'],
    },
    {
      isIntro: false,
      header: 'Tadalafil Hardies',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/beige-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      includeRegions: ['CA'],
    },
    {
      isIntro: false,
      header: 'Sildenafil',
      subheader: '(Generic Viagra®)',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/viagra_pill.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
    },
    {
      isIntro: false,
      header: 'Tadalafil',
      subheader: '(Generic Cialis)',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/images/programs/cialis.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
    },
  ];

  // filter programs based on patient's region
  const patientRegion = patient.region;
  const edPrograms = allEdPrograms.filter(program => {
    // if the program has no includeRegions or excludeRegions, include it
    let shouldIncludeBasedOnRegion = true;
    // if the program has an includeRegions array, only include if the patient's region is in that array
    if (program.includeRegions) {
      shouldIncludeBasedOnRegion = program.includeRegions.includes(
        patientRegion!
      );
    }
    // if the program has an excludeRegions array, only include if the patient's region is not in that array
    if (program.excludeRegions) {
      shouldIncludeBasedOnRegion = !program.excludeRegions.includes(
        patientRegion!
      );
    }
    return shouldIncludeBasedOnRegion;
  });

  return edPrograms;
};

export const performancePrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'Boost Performance',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/performance.svg',
    specificCare: SpecificCareOption.ENCLOMIPHENE,
  },
  {
    isIntro: false,
    header: 'Performance Protocol',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/pre-workout-bottle.svg',
    specificCare: SpecificCareOption.PRE_WORKOUT,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Enclomiphene',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/enclom-pill.svg',
    specificCare: SpecificCareOption.ENCLOMIPHENE,
  },
];

export const mentalHealthPrograms = (
  patient: PatientProps
): ProgramContentData[] => [
  {
    isIntro: true,
    intro: 'Get mental health care',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/mental-health.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    header: 'Fluoxetine',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/fluoxtine-pill.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    header: 'Escitalopram',
    subheader: '(Generic for Lexapro®)',

    isMH: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/escital-bottle.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    header: 'Citalopram',
    subheader: '(Generic for Celexa®)',

    isMH: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/citalopram-bottle.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    header: 'Paroxetine',
    subheader: '(Generic for Paxil®)',

    isMH: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/paroxetine-bottle.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Sertraline',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/sertraline-pill.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
];

export const skincarePrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'Clearer skin within reach',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/skincare.svg',
    specificCare: SpecificCareOption.SKINCARE,
  },
  {
    isIntro: false,
    header: 'Acne Cream',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/acne-cream.svg',
    specificCare: SpecificCareOption.ACNE,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Acne Treatment',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/acne-bottle.svg',
    specificCare: SpecificCareOption.ACNE,
  },
  {
    isIntro: false,

    header: 'Prescription Melasma Cream',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/melasma-cream.svg',
    specificCare: SpecificCareOption.MELASMA,
  },
  {
    isIntro: false,

    header: 'Prescription Rosacea Cream',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/rosacea-cream.svg',
    specificCare: SpecificCareOption.ROSACEA,
  },
  {
    isIntro: false,

    header: 'Prescription Anti-Aging Cream',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/anti-aging-cream.svg',
    specificCare: SpecificCareOption.ANTI_AGING,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Doxycycline',
    subheader: '(oral rosacea treatment)',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/doxycycline.svg',
    specificCare: SpecificCareOption.ROSACEA,
  },
];

export const prepPrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'PrEP',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/man-smiling.svg',
    specificCare: SpecificCareOption.PREP,
  },
  {
    isIntro: false,
    header: 'PrEP',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/prep-pill.svg',
    specificCare: SpecificCareOption.PREP,
  },
];

export const sleepPrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'Sleep Better',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/man-smiling.svg',
    specificCare: SpecificCareOption.SLEEP,
  },
  {
    isIntro: false,
    header: 'Ramelteon',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/minoxidil-pill.svg',
    specificCare: SpecificCareOption.SLEEP,
  },
];

export const hairLossPrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'Restore Hair',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/men-hair-loss.svg',
    specificCare: SpecificCareOption.HAIR_LOSS,
  },
  {
    isIntro: false,
    header: 'Finasteride',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/finasteride-pill.svg',
    specificCare: SpecificCareOption.HAIR_LOSS,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Minoxidil',
    subheader: '(enhances hair regrowth)',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/minoxidil-pill.svg',
    specificCare: SpecificCareOption.HAIR_LOSS,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Hair Strengthening Solution',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/hair-solution.svg',
    specificCare: SpecificCareOption.HAIR_LOSS,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Hair Restore Cream',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/hair-cream.svg',
    specificCare: SpecificCareOption.HAIR_LOSS,
  },
];

/// Women Programs
export const birthControlPrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'Get birth control',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/birth-control.svg',
    specificCare: SpecificCareOption.BIRTH_CONTROL,
  },
  {
    isIntro: false,
    header: 'Sprintec',

    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/sprintec_pack.svg',
    specificCare: SpecificCareOption.BIRTH_CONTROL,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Simpesse',

    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/simpesse-pill.svg',
    specificCare: SpecificCareOption.BIRTH_CONTROL,
  },
  {
    isIntro: false,

    header: 'Blisove-fe',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/blisovife_pack.svg',
    specificCare: SpecificCareOption.BIRTH_CONTROL,
  },
];

export const menopausePrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'Stay on track',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/menopause-programs-intro.svg',
    specificCare: SpecificCareOption.MENOPAUSE,
  },
  {
    isIntro: false,
    header: 'Menopause',

    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/sprintec_pack.svg',
    specificCare: SpecificCareOption.MENOPAUSE,
  },
];

export const womenMentalHealthPrograms = (
  patient: PatientProps
): ProgramContentData[] => [
  {
    isIntro: true,
    intro: 'Get mental health care',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/women-mental-health.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    header: 'Fluoxetine',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/fluoxtine-pill.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    header: 'Escitalopram',
    subheader: '(Generic for Lexapro®)',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/escital-bottle.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    header: 'Citalopram',
    subheader: '(Generic for Celexa®)',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/citalopram-bottle.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    header: 'Paroxetine',
    subheader: '(Generic for Paxil®)',
    isBottle: true,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/paroxetine-bottle.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Sertraline',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/sertraline-pill.svg',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  },
];

export const femaleHairLossPrograms: ProgramContentData[] = [
  {
    isIntro: true,
    intro: 'Restore Hair',
    buttonColor: '#ffffff',
    bgImage:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/women-hair-loss.svg',
    specificCare: SpecificCareOption.FEMALE_HAIR_LOSS,
  },

  {
    isIntro: false,
    isBottle: true,
    header: 'Minoxidil',
    subheader: '(enhances hair regrowth)',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/minoxidil-pill.svg',
    specificCare: SpecificCareOption.FEMALE_HAIR_LOSS,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Hair Strengthening Solution',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/hair-solution.svg',
    specificCare: SpecificCareOption.FEMALE_HAIR_LOSS,
  },
  {
    isIntro: false,
    isBottle: true,
    header: 'Hair Restore Cream',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/hair-cream.svg',
    specificCare: SpecificCareOption.FEMALE_HAIR_LOSS,
  },
];

export const everydayFavorites = [
  {
    price: 18,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/melatonin_bottle.svg',
    name: 'Melatonin Tablets',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 470 : 431,
    description:
      'Zealthy’s Melatonin Advanced is a 2-layer controlled release tablet that releases melatonin quickly to help you fall asleep faster, and then the controlled release inner layer helps you stay asleep through the night.',
    loveIt: [
      {
        'All natural ingredients':
          'No artificial flavors, no artificial sweeteners, no synthetic dyes, non-GMO.',
      },
      {
        'Better Sleep':
          'Helps to establish normal sleep patterns to give you a more restful, relaxing sleep.',
      },
      {
        'Advanced Formulation':
          'All in one advanced sleep formulation for sleep which includes Melatonin, Vitamin B, and Calcium.',
      },
    ],
    details: [
      'Advanced formula with maximum strength 10 mg',
      'Combined with 10 mg of B6 to support the body’s production of melatonin†',
      'No artificial flavors, no artificial sweeteners, no synthetic dyes, non-GMO',
    ],
    instructions: {
      'How to take your Melatonin Tablet':
        'Take one (1) tablet 30 minutes before bedtime.',
    },
  },
  {
    price: 30,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/probiotic_bottle.svg',
    name: 'Probiotic Capsules',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 471 : 432,
    description:
      'Supports your gastrointestinal microbiome, where 70% of your immune system resides, for overall health and wellness.',
    loveIt: [
      {
        'Restore your Gut':
          'Lactobacillus rhamnosus GG helps you restore the balance of bacteria to help keep your digestive system running smoothly and your immune system going strong.',
      },
      {
        'Clinically Backed':
          'Each serving  or capsule of this immune support formula delivers 15 billion CFUs of Lactobacillus rhamnosus GG, the world’s most clinically studied probiotic.',
      },
      {
        'Individually Sealed':
          'Each serving individually sealed to prevent moisture, light & air from getting in.',
      },
    ],
    details: [
      'No Need to Refrigerate- store in a cool, dry place away from sunlight',
      'Daily dose that comes in a vegetarian capsule',
      'No Artificial Dyes, Dairy, Wheat, Eggs, Peanuts & Tree Nuts',
    ],
    instructions: {
      'How to take your Probiotic Supplement':
        'For daily use, take one (1) capsule per day. For optimal results, daily use is suggested.',
    },
  },
  {
    price: 26,
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/magnesium_bottle.svg',
    name: 'Magnesium Citrate Capsules',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 469 : 433,
    description:
      'One of the most taken supplements today is magnesium citrate.  It is the most powerful relaxation mineral available, and it may also help improve sleep. Magnesium is one of the most abundant minerals in soft tissues and is a vital catalyst in enzyme health. Magnesium also supports in maintaining healthy energy levels and proper calcium absorption.',
    loveIt: [
      {
        'Health Benefits of Magnesium':
          'Promotes Healthy Nerve, Muscle & Heart Function',
      },
      {
        'Better Sleep': 'May Improve Regular Sleep Cycles',
      },
      {
        'Bone Strength Support':
          'Helps in Supporting Proper Calcium Absorption',
      },
    ],
    details: [
      'No Artificial Dyes, Dairy, Wheat, Eggs, Peanuts & Tree Nuts',
      '33 Servings per Bottle',
      'Daily dose that comes in a vegetarian capsule',
    ],
    instructions: {
      'How to take Magnesium Citrate Capsules':
        'Take three (3) capsules daily with a meal, or as directed by a healthcare professional.',
    },
  },
];
