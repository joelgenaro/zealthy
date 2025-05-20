export const insuranceOptions = [
  {
    index: 1,
    header: 'Insurance + Access to affordable GLP-1',
    subText: [
      'Only available for people that have insurance, but can get GLP-1 delivered',
      'This process may take 1-3 weeks to receive response for GLP-1 approval requests depending on the insurer',
    ],
    buttonText: 'I plan to use insurance',
  },
  {
    index: 2,
    header: 'Affordable GLP-1 (no insurance needed)',
    subText: [
      'Pay as little as $151/month for GLP-1 delivered straight to your door',
      'Members achieve lasting weight loss sooner when they request GLP-1’s like semaglutide or tirzepatide',
    ],
    buttonText: 'I don’t plan to use insurance',
  },
];

export const insuranceOptionV2 = [
  {
    index: 2,
    header: 'Affordable GLP-1 (no insurance needed)',
    banner: ['In-Stock', 'No Wait'],
    percentage: '7-8%',
    fact: 'expected weight loss every 3 months*',
    list: [
      {
        check: true,
        fact: 'It is semaglutide, the active ingredient in Ozempic and Wegovy,  or tirzepatide, the active ingredient in Mounjaro and Zepbound',
      },
      {
        check: true,
        fact: 'Doctor + medication included - no hidden fees',
      },
      { check: true, fact: 'Get medication & refills quickly' },
      {
        check: true,
        fact: 'Compounded in compliance with quality standards',
      },
    ],
    buttonText: 'Get Started With No Insurance',
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/insurance-bottles.svg',
  },
  {
    index: 1,
    header: 'Insurance + Access to affordable GLP-1',
    banner: ['May Be Shortages', '1-3 Weeks'],
    list: [
      {
        check: true,
        fact: 'Your plan coverage and savings cards may help lower costs - just pay your co-pay for medication',
      },
      {
        check: false,
        fact: 'Patients may wait 30+ days for supply of Wegovy',
      },
      {
        check: false,
        fact: 'Refill challenges may cause treatment gaps',
      },
    ],
    buttonText: 'Process My Insurance',
  },
];
