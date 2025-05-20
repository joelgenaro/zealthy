import { SupabaseClient } from '@supabase/supabase-js';
import vwoSDK from 'vwo-node-sdk';
import { Database } from '../database.types';

const apiKey =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? 'd42a7fbcda07ddc126100551f3baec59'
    : '4143e257216da1ad125cf67f98503f68';

type IsPatient = {
  id: number;
  profile_id: string;
  first_name?: string;
  last_name?: string;
};

class VWOClient {
  private static _instance: VWOClient;
  private _vwo: vwoSDK.vwoInstance;
  private _supabase: SupabaseClient<Database>;
  private static _testingUsers = [
    'zTEST zzzTEST',
    'zzTEST zzzTEST',
    'zzzTEST zzzTEST',
    'zzzzTEST zzzTEST',
    'zzzzzTEST zzzTEST',
    'zzzzzzTEST zzzTEST',
    'zzzzzzzTEST zzzTEST',
    'zzzzzzzzTEST zzzTEST',
  ];

  private constructor(
    vwo: vwoSDK.vwoInstance,
    supabase: SupabaseClient<Database>
  ) {
    this._supabase = supabase;
    this._vwo = vwo;
  }

  static async getInstance(supabase: SupabaseClient<Database>) {
    if (this._instance) {
      return this._instance;
    }

    const settingsFile = await vwoSDK.getSettingsFile('770224', apiKey);
    const vwoClientInstance = vwoSDK.launch({ settingsFile });

    this._instance = new VWOClient(vwoClientInstance, supabase);
    return this._instance;
  }

  public generateName(
    first_name: string | undefined,
    last_name: string | undefined
  ) {
    return `${first_name ?? ''} ${last_name ?? ''}`;
  }

  public getVwoOptions(name: string) {
    let vwoOpts: vwoSDK.VWOApiOptions | undefined = undefined;
    if (VWOClient._testingUsers.includes(name)) {
      vwoOpts = {
        variationTargetingVariables: {
          'User Name': name,
        },
      };
    }
    return vwoOpts;
  }

  public getVariationName(campaignSpecifier: string, patient: IsPatient) {
    const vwoOptions = this.getVwoOptions(
      this.generateName(patient?.first_name, patient?.last_name)
    );
    return this._vwo?.getVariationName(
      campaignSpecifier,
      String(patient?.id),
      vwoOptions
    );
  }

  public async track(
    campaignSpecifier: string,
    patient: IsPatient,
    goalIdentifier: string
  ) {
    const vwoTracker = this._vwo?.track(
      campaignSpecifier,
      String(patient?.id),
      goalIdentifier
    );

    await this._supabase.from('ab_campaign_metric').insert({
      profile_id: patient?.profile_id,
      metric_name: goalIdentifier,
      campaign_key: campaignSpecifier,
    });

    return vwoTracker;
  }

  public async activate(campaignSpecifier: string, patient: IsPatient) {
    const vwoOptions = this.getVwoOptions(
      this.generateName(patient?.first_name, patient?.last_name)
    );
    const variationName = this._vwo?.activate(
      campaignSpecifier,
      String(patient?.id),
      vwoOptions
    );
    if (patient.profile_id && variationName) {
      const { data: existingRows } = await this._supabase
        .from('ab_campaign_user')
        .select('*')
        .eq('campaign_key', campaignSpecifier)
        .eq('profile_id', patient?.profile_id)
        .eq('variation_name', variationName);
      if (!existingRows?.length) {
        await this._supabase.from('ab_campaign_user').insert({
          campaign_key: campaignSpecifier,
          profile_id: patient?.profile_id,
          variation_name: variationName,
        });
      }
    }
    return variationName;
  }
}

export default VWOClient;
