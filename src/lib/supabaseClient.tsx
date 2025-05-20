import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';
import getConfig from '../../config';

export const supabaseClient = createBrowserSupabaseClient<Database>(
  ['frontend-next', 'frontend-zplan', 'fitrx-app'].includes(
    process.env.NEXT_PUBLIC_VERCEL_PROJECT!
  ) && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? {
        cookieOptions: {
          domain: getConfig(process.env.NEXT_PUBLIC_VERCEL_URL || '').domain,
          maxAge: '100000000',
          path: '/',
          sameSite: 'Lax',
          secure: 'secure',
        },
      }
    : {}
);
