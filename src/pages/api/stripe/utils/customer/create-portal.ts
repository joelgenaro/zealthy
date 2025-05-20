import getStripeInstance from '../../createClient';

export const createPortalSession = async (customerId: string) => {
  const stripe = getStripeInstance();

  try {
    const newPortal = await stripe.billingPortal.sessions.create({
      customer: customerId,
    });

    return { msg: 'success', url: newPortal.url };
  } catch (err: any) {
    console.error('createportal_err', { err });
    return {
      msg: 'err',
      err: err?.message || 'There was an unexpected error',
    };
  }
};
