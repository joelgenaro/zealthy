import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

type ConfigVariation = {
  url: string;
  name: string;
  stz_user_id: string;
};

function cleanUrl(url: string): string {
  console.log('Cleaning URL:', url);
  let decodedUrl = decodeURIComponent(url);
  console.log('Decoded URL:', decodedUrl);
  decodedUrl = decodedUrl.replace(/\/$/, '');
  decodedUrl = decodedUrl.replace(/(https?:\/\/)|(\/\/)/g, match => {
    return match === '//' ? '/' : match;
  });
  console.log('Cleaned URL:', decodedUrl);
  return decodedUrl;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API handler started');
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  const defaultResponse = {
    variation: { url: '', name: '' },
    key: '',
  };

  try {
    let { url, stz_user_id } = req.query;
    console.log('Received URL:', url);
    console.log('Received stz_user_id:', stz_user_id);

    if (
      !url ||
      typeof url !== 'string' ||
      !stz_user_id ||
      typeof stz_user_id !== 'string'
    ) {
      console.log('Invalid URL or stz_user_id, returning default response');
      return res.status(200).json(defaultResponse);
    }

    url = cleanUrl(url);
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const { data: configData, error: configError } = await supabase
      .from('st_zealthy_config')
      .select('*')
      .eq('control_url', url)
      .eq('is_live', true)
      .single();

    // If there's an error or no data, return the default response
    if (configError || !configData) {
      return res.status(200).json(defaultResponse);
    }

    if (!configData) {
      return res.status(200).json(defaultResponse);
    }

    const variations = configData.variations as ConfigVariation[];
    console.log('Variations:', variations);

    if (!variations || variations.length === 0) {
      return res.status(200).json(defaultResponse);
    }

    const randomIndex = Math.floor(Math.random() * variations.length);
    const variation = variations[randomIndex];
    const campaignKey = configData.campaign_key;

    const { error: insertError } = await supabase
      .from('st_zealthy_user_variation')
      .insert({
        campaign_key: campaignKey,
        variation_name: variation.name,
        stz_user_id: stz_user_id,
        profile_id: null,
      });

    if (insertError) {
      console.error('Error inserting user variation:', insertError);
      return res.status(200).json(defaultResponse);
    }

    const response = {
      variation,
      key: campaignKey,
    };
    console.log('Sending response:', response);
    return res.status(200).json(response);
  } catch (err) {
    console.error('Unexpected error in get-config API:', err);
    return res.status(200).json(defaultResponse);
  }
}
