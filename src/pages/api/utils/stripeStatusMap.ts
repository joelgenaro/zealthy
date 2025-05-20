import Stripe from 'stripe';

export const statusMap: { [key in Stripe.Subscription['status']]: string } = {
  trialing: 'active',
  active: 'active',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'incomplete_expired',
  past_due: 'past_due',
  paused: 'pause',
  unpaid: 'unpaid',
};
