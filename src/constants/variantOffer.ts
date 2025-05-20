export type Offer = {
  header: string;
  subHeaders: string[];
  body1: string;
  body2?: string;
  buttonText?: string;
};

export const variantOffer: {
  [key: string]: Offer;
} = {
  '2805': {
    header: 'Limited Time Offer: ',
    subHeaders: [
      'Sign up today and lock in your weight loss care, including semaglutide to your door.',
    ],
    body1:
      'Claim this one time offer and begin losing weight right away. Semaglutide is the main active ingredient in Wegovy® and Ozempic®.',
  },
  '2806': {
    header: 'Limited Time Offer: ',
    subHeaders: [
      'Sign up today and lock in your weight loss care, including tirzepatide to your door.',
    ],
    body1:
      'Claim this one time offer and begin losing weight right away. Tirzepatide is the main active ingredient in Mounjaro® and Zepbound™.',
  },
  '4758': {
    header: 'Limited Time Offer:',
    subHeaders: ['$116 off first month of Zealthy Weight Loss Program!'],
    body1: 'Claim this one-time offer and begin losing weight right away.',
  },
};
