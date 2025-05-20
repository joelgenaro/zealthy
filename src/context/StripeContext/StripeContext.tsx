import React, { ReactNode } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useLanguage } from '@/components/hooks/data';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';

interface StripeContextProviderProps {
  children: ReactNode;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const StripeContextProvider = ({ children }: StripeContextProviderProps) => {
  const user = useUser();
  const lan = useLanguage();

  // Convert 'esp' to 'es' for Stripe, keep 'en' as is
  const stripeLocale = lan === 'esp' ? 'es' : 'en';

  // Properly type the options object
  const stripeOptions: StripeElementsOptions = {
    locale: stripeLocale as StripeElementsOptions['locale'],
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      {children}
    </Elements>
  );
};

export default StripeContextProvider;
