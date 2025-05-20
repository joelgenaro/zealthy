import { useUser } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';
import { ProfileInfo } from './useProfile';

export const useIdentityEvent = () => {
  const user = useUser();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useCallback(
    async (info: ProfileInfo, subscribed_to_sms_marketing = true) => {
      let e164Phone = info?.phone_number?.replace(/\D/g, '');
      if (e164Phone?.length === 11 && e164Phone?.[0] === '1') {
        e164Phone = '+' + e164Phone;
      } else if (e164Phone?.length === 10 && e164Phone?.[0] !== '1') {
        e164Phone = '+1' + e164Phone;
      }
      info.phone_number = e164Phone;
      if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && user?.id) {
        if (user?.email && user?.email !== user?.id) {
          window.freshpaint.alias(user.email, user.id);
        }
        window.freshpaint.identify(user.id, {
          first_name: info.first_name,
          last_name: info.last_name,
          email: user.email,
          phone: info.phone_number,
          timezone: timezone,
          cio_subscription_preferences: {
            topics: {
              topic_1: subscribed_to_sms_marketing,
            },
          },
        });
        window.rudderanalytics.identify(user.id, {
          first_name: info.first_name,
          last_name: info.last_name,
          email: user.email,
          phone: info.phone_number,
          timezone: timezone,
          cio_subscription_preferences: {
            topics: {
              topic_1: subscribed_to_sms_marketing,
            },
          },
        });
      }
    },
    [timezone, user?.email, user?.id]
  );
};
