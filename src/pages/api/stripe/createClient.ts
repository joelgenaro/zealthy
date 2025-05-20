import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

const getStripeInstance = (): Stripe => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET) {
      throw new Error('Stripe secret is not set in the environment.');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET, {
      // @ts-ignore
      apiVersion: '2022-11-15',
    });
  }
  return stripeInstance;
};

export default getStripeInstance;
