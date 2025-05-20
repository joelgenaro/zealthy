import Stripe from 'stripe';

function inferSubscriptionMetadata(invoice: Stripe.Invoice) {
  const productPlusCareMap = {
    'Weight Loss': {
      zealthyCare: 'Weight loss',
      zealthyProduct: 'Weight Loss',
    },
    'Personalized Psychiatry': {
      zealthyCare: 'Anxiety or depression',
      zealthyProduct: 'Personalized Psychiatry',
    },
    Enclomiphene: {
      zealthyCare: 'Enclomiphene',
      zealthyProduct: 'Zealthy Product Enclomiphene',
    },
    Menopause: {
      zealthyCare: 'Menopause',
      zealthyProduct: 'Menopause',
    },
  };
  let inferredProduct:
    | 'Weight Loss'
    | 'Personalized Psychiatry'
    | 'Enclomiphene'
    | 'Menopause'
    | null = null;
  const firstLineItem = invoice?.lines?.data?.slice(-1)[0] ?? {};
  const description = invoice.description || firstLineItem.description;

  const isWLSubscriptionUpgrade =
    !!description?.includes('Subscription upgrade') &&
    !description?.toLowerCase()?.includes('psychiatry') &&
    !!description?.toLowerCase()?.includes('weight');

  const isPsychSubscriptionUpgrade =
    !!description?.includes('Subscription upgrade') &&
    !isWLSubscriptionUpgrade &&
    !!description?.includes('Personalized Psychiatry');

  const isWeightLossMembershipRenewal =
    firstLineItem.description &&
    firstLineItem.description?.includes(
      '1 × Zealthy Weight Loss (at $135.00 / month)'
    ) &&
    firstLineItem.amount === 13500;

  const isWeightLossCoaching =
    firstLineItem.description &&
    firstLineItem.description?.includes('1 × Weight Loss Coaching Only');

  const isPersonalizedPsychiatryCoaching =
    firstLineItem.description &&
    firstLineItem.description?.includes('1 × Zealthy Personalized Psychiatry');

  const isPersonalizedPsychiatryMembershipRenewal =
    firstLineItem.description &&
    firstLineItem.description?.includes(
      '1 × Zealthy Personalized Psychiatry'
    ) &&
    firstLineItem.amount === 9900;

  const isEnclomiphene =
    firstLineItem.metadata.zealthy_care?.includes('Enclomiphene') &&
    firstLineItem.metadata.zealthy_product?.includes(
      'Enclomiphene Medication Subscription'
    );

  const isMenopause =
    firstLineItem.metadata.zealthy_care?.includes('Menopause') &&
    firstLineItem.metadata.zealthy_product?.includes('Menopause');

  if (
    isWLSubscriptionUpgrade ||
    isWeightLossMembershipRenewal ||
    isWeightLossCoaching
  ) {
    inferredProduct = 'Weight Loss';
  } else if (
    isPersonalizedPsychiatryMembershipRenewal ||
    isPsychSubscriptionUpgrade ||
    isPersonalizedPsychiatryCoaching
  ) {
    inferredProduct = 'Personalized Psychiatry';
  } else if (isEnclomiphene) {
    inferredProduct = 'Enclomiphene';
  } else if (isMenopause) {
    inferredProduct = 'Menopause';
  }

  return inferredProduct
    ? productPlusCareMap[inferredProduct]
    : { zealthyCare: null, zealthyProduct: null };
}

export { inferSubscriptionMetadata };
