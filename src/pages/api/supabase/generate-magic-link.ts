import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function GenerateMagicLink(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    patientEmail,
    redirectTo = process.env.NEXT_PUBLIC_ENV === 'production'
      ? 'https://app.getzealthy.com'
      : 'https://frontend-next-git-development-zealthy.vercel.app',
  } = req.body;
  try {
    const supabaseAdmin = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    if (patientEmail) {
      const impersonationLoginGeneration =
        await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: patientEmail,
          options: {
            redirectTo,
          },
        });

      return res
        .status(200)
        .json(impersonationLoginGeneration.data.properties?.action_link);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(`There was an error processing your order`);
  }
}
