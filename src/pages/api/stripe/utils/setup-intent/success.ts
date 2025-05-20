import Stripe from 'stripe';

export const manageSetupIntentSuccess = async (
  setupIntent: Stripe.SetupIntent
) => {
  return { message: 'Ok' };
};
