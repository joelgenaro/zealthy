const hardiesOptions: { [key: string]: any } = {
  'Sildenafil 55 mg | Tadalafil 22 mg': {
    Standard: {
      price: 13,
      recommended: false,
      quantities: [
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
          popular: true,
          display_name: '6 uses per month',
          subheader: 'From $11/use',
          value: 18,
          price: 216,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 431 : 391,
          otherOptions: [
            {
              quantity: 6,
              price: 78,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 430 : 390,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 18,
              price: 216,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 431 : 391,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 30,
              price: 330,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 432 : 392,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
          popular: true,
          display_name: '8 uses per month',
          subheader: 'From $11/use',
          value: 24,
          price: 288,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 434 : 394,
          otherOptions: [
            {
              quantity: 8,
              price: 104,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 433 : 393,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 24,
              price: 288,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 434 : 394,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 40,
              price: 440,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 435 : 395,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
          popular: true,
          display_name: '10 uses per month',
          subheader: 'From $11/use',
          value: 30,
          price: 360,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 437 : 397,
          otherOptions: [
            {
              quantity: 10,
              price: 130,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 436 : 396,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 30,
              price: 360,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 437 : 397,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 50,
              price: 550,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 438 : 398,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
          popular: false,
          display_name: '16 uses per month',
          subheader: 'From $11/use',
          value: 48,
          price: 576,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 440 : 400,
          otherOptions: [
            {
              quantity: 16,
              price: 208,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 439 : 399,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 48,
              price: 576,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 440 : 400,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 80,
              price: 880,
              medication_quantity_id:
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 441 : 401,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
      ],
    },
  },
  'Sildenafil 45 mg | Tadalafil 15 mg': {
    Standard: {
      price: 13,
      recommended: false,
      quantities: [
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
          popular: true,
          display_name: '6 uses per month',
          subheader: 'From $11/use',
          value: 18,
          price: 180,
          medication_quantity_id: 431,
          otherOptions: [
            {
              quantity: 6,
              price: 66,
              medication_quantity_id: 430,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 18,
              price: 180,
              medication_quantity_id: 431,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 30,
              price: 270,
              medication_quantity_id: 432,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
          popular: true,
          display_name: '8 uses per month',
          subheader: 'From $11/use',
          value: 24,
          price: 240,
          medication_quantity_id: 434,
          otherOptions: [
            {
              quantity: 8,
              price: 88,
              medication_quantity_id: 433,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 24,
              price: 240,
              medication_quantity_id: 434,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 40,
              price: 360,
              medication_quantity_id: 435,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
          popular: true,
          display_name: '10 uses per month',
          subheader: 'From $11/use',
          value: 30,
          price: 300,
          medication_quantity_id: 437,
          otherOptions: [
            {
              quantity: 10,
              price: 110,
              medication_quantity_id: 436,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 30,
              price: 300,
              medication_quantity_id: 437,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 50,
              price: 450,
              medication_quantity_id: 438,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
          popular: false,
          display_name: '16 uses per month',
          subheader: 'From $11/use',
          value: 48,
          price: 480,
          medication_quantity_id: 440,
          otherOptions: [
            {
              quantity: 16,
              price: 176,
              medication_quantity_id: 439,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 48,
              price: 480,
              medication_quantity_id: 440,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 80,
              price: 720,
              medication_quantity_id: 441,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
      ],
    },
  },
  'Tadalafil 8.5 mg | Vardenafil 8.5 mg': {
    Standard: {
      price: 13,
      recommended: false,

      quantities: [
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
          popular: true,
          display_name: '6 uses per month',
          subheader: 'From $11/use',
          value: 18,
          price: 216,
          medication_quantity_id: 367,
          otherOptions: [
            {
              quantity: 6,
              price: 78,
              medication_quantity_id: 366,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 18,
              price: 216,
              medication_quantity_id: 367,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 30,
              price: 330,
              medication_quantity_id: 368,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
          popular: true,
          display_name: '8 uses per month',
          subheader: 'From $11/use',
          value: 24,
          price: 288,
          medication_quantity_id: 370,
          otherOptions: [
            {
              quantity: 8,
              price: 104,
              medication_quantity_id: 369,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 24,
              price: 288,
              medication_quantity_id: 370,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 40,
              price: 440,
              medication_quantity_id: 371,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
          popular: true,
          display_name: '10 uses per month',
          subheader: 'From $11/use',
          value: 30,
          price: 360,
          medication_quantity_id: 373,
          otherOptions: [
            {
              quantity: 10,
              price: 130,
              medication_quantity_id: 372,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 30,
              price: 360,
              medication_quantity_id: 373,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 50,
              price: 550,
              medication_quantity_id: 374,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
          popular: false,
          display_name: '16 uses per month',
          subheader: 'From $11/use',
          value: 48,
          price: 576,
          medication_quantity_id: 376,
          otherOptions: [
            {
              quantity: 16,
              price: 208,
              medication_quantity_id: 375,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 48,
              price: 576,
              medication_quantity_id: 376,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 80,
              price: 880,
              medication_quantity_id: 377,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
      ],
    },
  },
  'Tadalafil 5 mg | Vardenafil 5 mg': {
    Standard: {
      price: 13,
      recommended: false,

      quantities: [
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
          popular: true,
          display_name: '6 uses per month',
          subheader: 'From $11/use',
          value: 18,
          price: 66,
          medication_quantity_id: 367,
          otherOptions: [
            {
              quantity: 6,
              price: 66,
              medication_quantity_id: 366,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 18,
              price: 180,
              medication_quantity_id: 367,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 30,
              price: 270,
              medication_quantity_id: 368,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
          popular: true,
          display_name: '8 uses per month',
          subheader: 'From $11/use',
          value: 24,
          price: 240,
          medication_quantity_id: 370,
          otherOptions: [
            {
              quantity: 8,
              price: 88,
              medication_quantity_id: 369,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 24,
              price: 240,
              medication_quantity_id: 370,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 40,
              price: 360,
              medication_quantity_id: 371,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
          popular: true,
          display_name: '10 uses per month',
          subheader: 'From $11/use',
          value: 30,
          price: 300,
          medication_quantity_id: 373,
          otherOptions: [
            {
              quantity: 10,
              price: 110,
              medication_quantity_id: 372,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 30,
              price: 300,
              medication_quantity_id: 373,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 50,
              price: 450,
              medication_quantity_id: 374,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
        {
          image:
            'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
          popular: false,
          display_name: '16 uses per month',
          subheader: 'From $11/use',
          value: 48,
          price: 480,
          medication_quantity_id: 376,
          otherOptions: [
            {
              quantity: 16,
              price: 176,
              medication_quantity_id: 375,
              label: 'Monthly',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            {
              quantity: 48,
              price: 480,
              medication_quantity_id: 376,
              label: 'Every 3 months',
              recurring: {
                interval: 'month',
                interval_count: 3,
              },
            },
            {
              quantity: 80,
              price: 720,
              medication_quantity_id: 377,
              label: 'Every 5 months',
              recurring: {
                interval: 'month',
                interval_count: 5,
              },
            },
          ],
        },
      ],
    },
  },
};

export const mapStrengthToHardies = (strengths: string[]) =>
  strengths
    ?.map(strength => {
      const hardies = hardiesOptions[strength];
      console.log('HARDIES', hardies);
      return hardies;
      // return hardies.map(
      //   (name) =>

      // );
    })
    ?.filter(Boolean)
    ?.flat();
