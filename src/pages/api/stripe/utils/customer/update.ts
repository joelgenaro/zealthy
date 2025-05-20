import Stripe from 'stripe';

export const manageCustomerUpdate = async (customer: Stripe.Customer) => {
  console.info(JSON.stringify({ customerUpdate: customer }));
};
