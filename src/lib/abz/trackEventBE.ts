import { supabaseAdmin } from '@/lib/supabaseAdmin';

// to be used to track events in backend
export const trackEventABZ = async (
  campaignKey: string,
  profileId: string,
  metric: string
) => {
  const { data: userVariation, error: variationError } = await supabaseAdmin
    .from('ab_zealthy_user_variation')
    .select('variation_name')
    .eq('campaign_key', campaignKey)
    .eq('profile_id', profileId)
    .single();

  if (!userVariation || variationError) {
    return;
  }

  // Step 2: Check if the metric exists for the given campaign
  const { data: existingMetric } = await supabaseAdmin
    .from('ab_zealthy_metric')
    .select('metric_name')
    .eq('campaign_key', campaignKey)
    .eq('metric_name', metric)
    .single();

  if (!existingMetric) {
    throw new Error('Metric does not exist for this campaign');
  }

  // Step 3: Check if the user has already tracked this metric for the campaign
  const { data: userMetric } = await supabaseAdmin
    .from('ab_zealthy_user_metric')
    .select('metric_name')
    .eq('campaign_key', campaignKey)
    .eq('profile_id', profileId)
    .eq('metric_name', metric)
    .single();

  if (userMetric) {
    return;
  }

  // Step 4: Insert the new metric into the user_metric table
  const { error: insertError } = await supabaseAdmin
    .from('ab_zealthy_user_metric')
    .insert({
      campaign_key: campaignKey,
      metric_name: metric,
      profile_id: profileId,
    });

  if (insertError) {
    throw new Error(`Error tracking metric: ${insertError.message}`);
  }

  return;
};
