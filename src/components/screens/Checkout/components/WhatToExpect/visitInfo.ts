import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';

export const asyncVisitInfo: {
  [key in SpecificCareOption]: {
    title: string;
    body: string;
  }[];
} = {
  'Weight loss': [],
  'Weight loss ad': [],
  'Mental health': [],
  'Weight loss access': [],
  'Weight loss access v2': [],
  Other: [],
  'Birth control': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  Enclomiphene: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  Preworkout: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  'Anxiety or depression': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  'Hair loss': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  'Hair Loss': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  'Erectile dysfunction': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  'Primary care': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  'Virtual Urgent Care': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  Acne: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'Your provider will prescribe your requested medication, which we can deliver to your doorstep (if medically appropriate).',
      body: 'Delivery is free!',
    },
  ],
  'Fine Lines & Wrinkles': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'Your provider will prescribe your requested medication, which we can deliver to your doorstep (if medically appropriate).',
      body: 'Delivery is free!',
    },
  ],
  'Hyperpigmentation Dark Spots': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'Your provider will prescribe your requested medication, which we can deliver to your doorstep (if medically appropriate).',
      body: 'Delivery is free!',
    },
  ],
  Rosacea: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'Your provider will prescribe your requested medication, which we can deliver to your doorstep (if medically appropriate).',
      body: 'Delivery is free!',
    },
  ],
  Skincare: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and develop a personalized skincare treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view your recommended skincare treatment plan.',
    },
    {
      title:
        'Your provider will prescribe your personalized skincare treatment, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  Prep: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  'Sex + Hair': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  Sleep: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  'Weight Loss Free Consult': [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  Menopause: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  Default: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
};

export const syncVisitInfo = {
  [`${PotentialInsuranceOption.WEIGHT_LOSS_SYNC} ${SpecificCareOption.WEIGHT_LOSS}`]:
    [
      {
        body: 'Speak with your Zealthy provider from the comfort of your home.',
      },
      {
        body: 'Your provider will diagnose and prescribe medication if medically appropriate.',
      },
      {
        body: 'Pick up your medication or get at-home delivery, if prescribed.',
      },
      {
        body: 'Message with your Zealthy care team at no extra cost.',
      },
    ],
  [`${PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA} ${SpecificCareOption.WEIGHT_LOSS}`]:
    [
      {
        body: 'Speak with your Zealthy provider from the comfort of your home.',
      },
      {
        body: 'Your provider will diagnose and prescribe medication if medically appropriate.',
      },
      {
        body: 'Pick up your medication or get at-home delivery, if prescribed.',
      },
      {
        body: 'Message with your Zealthy care team at no extra cost.',
      },
    ],
  [`${PotentialInsuranceOption.BLUE_CROSS_ILLINOIS} ${SpecificCareOption.PRIMARY_CARE}`]:
    [
      {
        body: 'Speak with your Zealthy provider from the comfort of your home.',
      },
      {
        body: 'Your provider will diagnose and prescribe medication if medically appropriate.',
      },
      {
        body: 'Pick up your medication or get at-home delivery, if prescribed.',
      },
      {
        body: 'Message with your Zealthy care team at no extra cost.',
      },
    ],
  [`${PotentialInsuranceOption.OUT_OF_NETWORK} ${SpecificCareOption.PRIMARY_CARE}`]:
    [
      {
        body: 'Speak with your Zealthy provider from the comfort of your home.',
      },
      {
        body: 'Your provider will diagnose and prescribe medication if medically appropriate.',
      },
      {
        body: 'Pick up your medication or get at-home delivery, if prescribed.',
      },
      {
        body: 'Message with your Zealthy care team at no extra cost.',
      },
    ],
  [`${PotentialInsuranceOption.AETNA} ${SpecificCareOption.PRIMARY_CARE}`]: [
    {
      body: 'Speak with your Zealthy provider from the comfort of your home.',
    },
    {
      body: 'Develop personalized treatment plan all online.',
    },
    {
      body: 'Pick up your prescription or get at-home delivery of medication, if prescribed.',
    },
  ],
  [`${PotentialInsuranceOption.AETNA} ${SpecificCareOption.ANXIETY_OR_DEPRESSION}`]:
    [
      {
        body: 'Speak with your Zealthy psychiatric provider from the comfort of your home within minutes.',
      },
      {
        body: 'Develop personalized treatment plan all online.',
      },
      {
        body: 'Pick up your prescription or get at-home delivery of medication, if prescribed.',
      },
      {
        body: 'Select a mental health coach who you can message with any time and hold video or phone sessions with (optional).',
      },
    ],
  [SpecificCareOption.ANXIETY_OR_DEPRESSION]: [
    {
      body: 'Speak with your Zealthy provider from the comfort of your home.',
    },
    {
      body: 'Personalized treatment plan, including medication delivered to your home if prescribed.',
    },
    {
      body: 'Unlimited messaging with your provider and coordinator for support.',
    },
    {
      body: 'Cancel any time.',
    },
  ],
  [SpecificCareOption.PRIMARY_CARE]: [
    {
      body: 'Speak with your Zealthy provider from the comfort of your home.',
    },
    {
      body: 'Pick up your prescription or get at-home delivery of medication, if prescribed.',
    },
    {
      body: 'Unlimited messaging with your provider for support.',
    },
    {
      body: 'Follow-up appointments as requested by you and primary care catered to your needs',
    },
  ],
  [SpecificCareOption.VIRTUAL_URGENT_CARE]: [
    {
      body: 'Speak with your Zealthy provider from the comfort of your home within minutes.',
    },
    {
      body: 'Develop personalized treatment plan all online.',
    },
    {
      body: 'Pick up your prescription or get at-home delivery of medication, if prescribed.',
    },
  ],
  [SpecificCareOption.HAIR_LOSS]: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  [SpecificCareOption.ERECTILE_DYSFUNCTION]: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  [SpecificCareOption.BIRTH_CONTROL]: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  [SpecificCareOption.ENCLOMIPHENE]: [
    {
      title: 'Your medical information will be sent to your Zealthy provider.',
      body: 'Your provider will review this information and determine a treatment plan.',
    },
    {
      title: 'Your provider will follow-up with you.',
      body: 'You will receive a notification via email or text to view their recommended treatment plan.',
    },
    {
      title:
        'If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
      body: 'Delivery is free!',
    },
  ],
  [SpecificCareOption.WEIGHT_LOSS]: [],
  Default: [
    {
      body: 'Speak with your Zealthy provider from the comfort of your home.',
    },
    {
      body: 'Tell your care provider about any symptoms you have. If applicable, your provider will prescribe medication, which we can deliver to your doorstep.',
    },
    {
      body: 'Message with your provider 24/7 for follow-up care at no extra cost.',
    },
    {
      body: 'Work with your provider to determine if additional testing is needed for treatment and diagnosis.',
    },
  ],
};
