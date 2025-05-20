import Router, { useRouter } from 'next/router';
import { FormEvent, useEffect, useState, memo, FormEventHandler } from 'react';
import { Provider } from '@supabase/supabase-js';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useLanguage } from '@/components/hooks/data';
import {
  SpecificCareOption,
  PotentialInsuranceOption,
} from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import retrieveUtmDataForSupabase from '@/utils/retrieveUtmData';
import { mapVariantToCareType } from '@/utils/mapVariantToCareType';
import dynamic from 'next/dynamic';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import CustomText from '../Text/CustomText';
import { Database } from '@/lib/database.types';
import { CouponCode } from '@/components/hooks/data';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { bmgAccountCreatedEvent, bmgSignUpEvent } from '@/utils/bmg/events';
import { useProfileAsync } from '@/components/hooks/useProfile';
import getConfig from '../../../../config';
import axios from 'axios';
import Spinner from '../Loading/Spinner';
import { trackWithDeduplication } from '@/utils/freshpaint/utils';

interface SignUpFormProps {
  isSignUp: boolean;
  nextRoute: string;
  referral?: any;
  code?: CouponCode;
  siteName: string;
}

enum ProfileApp {
  ZPlan = 'ZPlan',
  FitRxApp = 'FitRxApp',
  Zealthy = 'Zealthy',
}

// Dynamically import heavy components
const StackDynamic = dynamic(() => import('@mui/material/Stack'), {
  ssr: true,
});
const BoxDynamic = dynamic(() => import('@mui/material/Box'), { ssr: true });
const DividerDynamic = dynamic(() => import('@mui/material/Divider'), {
  ssr: true,
});
const FormControlDynamic = dynamic(() => import('@mui/material/FormControl'), {
  ssr: true,
});
const InputLabelDynamic = dynamic(() => import('@mui/material/InputLabel'), {
  ssr: true,
});
const FilledInputDynamic = dynamic(() => import('@mui/material/FilledInput'), {
  ssr: true,
});
const InputAdornmentDynamic = dynamic(
  () => import('@mui/material/InputAdornment'),
  { ssr: true }
);
const IconButtonDynamic = dynamic(() => import('@mui/material/IconButton'), {
  ssr: true,
});

// Lazy load icons
const VisibilityDynamic = dynamic(
  () => import('@mui/icons-material/Visibility'),
  { ssr: false }
);
const VisibilityOffDynamic = dynamic(
  () => import('@mui/icons-material/VisibilityOff'),
  { ssr: false }
);
const AppleLogoDynamic = dynamic(
  () => import('@/components/shared/SSOSignUp/assets/AppleLogo'),
  { ssr: false }
);
const FacebookLogoDynamic = dynamic(
  () => import('@/components/shared/SSOSignUp/assets/FacebookLogo'),
  { ssr: false }
);
const GoogleLogoDynamic = dynamic(
  () => import('@/components/shared/SSOSignUp/assets/GoogleLogo'),
  { ssr: false }
);

const SignUpFormComponent = ({
  isSignUp,
  nextRoute,
  referral,
  code,
  siteName,
}: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const { query } = router;
  const handleClickShowPassword = () => setShowPassword(show => !show);
  const updateProfile = useProfileAsync();
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const language = useLanguage();

  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };
  const { accountCreatedEvent, domain } = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  );

  const profileData = async (profileId: string) => {
    return await supabase.from('profiles').select('*').eq('id', profileId);
  };

  useEffect(() => {
    if (specificCare && specificCare == 'Weight loss') {
      trackWithDeduplication('weight-loss-sign-up');
    }
  }, [specificCare]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (router.pathname === Pathnames.SIGN_UP) {
        localStorage.removeItem('specificCare');
        addSpecificCare(null);
      } else {
        const storedCare = localStorage.getItem('specificCare');
        if (storedCare) {
          addSpecificCare(storedCare as SpecificCareOption);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (specificCare && typeof window !== 'undefined') {
      localStorage.setItem('specificCare', specificCare);
    }
  }, [specificCare]);

  useEffect(() => {
    if (
      !specificCare &&
      Object.values(SpecificCareOption).includes(
        query.care as SpecificCareOption
      )
    ) {
      addSpecificCare(query.care as SpecificCareOption);
    }
  }, [query.care]);

  async function signInWithOAuth(provider: Provider) {
    const sessionState = {
      specificCare: specificCare || '',
      potentialInsurance: potentialInsurance || '',
      variant: variant || '',
    };

    localStorage.setItem('sessionState', JSON.stringify(sessionState));

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });
  }
  const flexibleCareType =
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED
      ? 'Semaglutide Bundled Flexible'
      : 'Weight Loss Flexible';

  const leadEventName = (care: string) => {
    const eventName: any = {
      Enclomiphene: 'lead-enclomiphene',
      'Weight loss': 'lead-weight_loss',
      'Erectile dysfunction': 'lead-ed',
      Hardies: 'lead-hardies',
    };

    return eventName[care] || 'lead-other_products';
  };

  const accountCreatedEventName = (care: string) => {
    const eventName: any = {
      Enclomiphene: 'account_created-enclomiphene',
      'Weight loss': 'account_created-weight_loss',
      'Erectile dysfunction': 'account_created-ed',
      Hardies: 'account_created-hardies',
      'Hair Loss': 'account_created-female_hair_loss',
      'Primary care': 'account_created-primary_care',
      Sleep: 'account_created-insomnia',
    };

    return eventName[care] || 'account_created-other_products';
  };

  const eventName =
    leadEventName(specificCare || '') ||
    leadEventName(potentialInsurance || '');
  const acEventName =
    accountCreatedEventName(specificCare || '') ||
    accountCreatedEventName(potentialInsurance || '');

  const getProfileApp = () => {
    switch (domain) {
      case 'getzplan.com':
        return ProfileApp.ZPlan;
      case 'fitrxapp.com':
        return ProfileApp.FitRxApp;
      case 'getzealthy.com':
      default:
        return ProfileApp.Zealthy;
    }
  };

  const getRedirectUrl = (profileApp: ProfileApp) => {
    const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
    let baseUrl;
    switch (profileApp) {
      case ProfileApp.ZPlan:
        baseUrl = isProduction
          ? 'https://app.getzplan.com/'
          : 'https://frontend-zplan-git-development-zealthy.vercel.app/';
        break;
      case ProfileApp.FitRxApp:
        baseUrl = isProduction
          ? 'https://go.fitrxapp.com/'
          : 'https://fitrx-app-git-development-zealthy.vercel.app/';
        break;
      case ProfileApp.Zealthy:
      default:
        baseUrl = isProduction
          ? 'https://app.getzealthy.com/'
          : 'https://frontend-next-git-development-zealthy.vercel.app/';
        break;
    }

    return baseUrl;
  };

  const handleMagicLink = async (profileEmail: string, redirectTo: string) => {
    const magicLinkParams = {
      method: 'POST',
      url: `/api/supabase/generate-magic-link`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        patientEmail: profileEmail || '',
        redirectTo: redirectTo || '',
      },
    };
    const magicLink = await axios(magicLinkParams);
    window.location.href = magicLink.data;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const tokenPromise = window.grecaptcha.enterprise.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
      { action: 'LOGIN' }
    );

    // Proceed with auth while token is being generated
    let result = !isSignUp
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    const { data, error } = result;

    if (error) {
      const message = error.message.includes('abcdefghijklmnopqrstuvwxyz')
        ? language === 'esp'
          ? 'Tu contraseña debe tener al menos 8 caracteres, contener al menos un número, un carácter especial y una combinación de letras mayúsculas y minúsculas.'
          : 'Your password must be at least 8 characters long, contain at least one number, a special character, and have a mixture of uppercase and lowercase letters.'
        : error.message;

      setError(message);
      setLoading(false);
      return false;
    }

    const profileApp = getProfileApp();

    if (data && isSignUp) {
      try {
        const token = await tokenPromise;

        // keepalive to ensure the request completes even if user navigates away
        fetch('/api/google/verify-recaptcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, userId: data.user?.id }),
          keepalive: true,
        }).catch(err =>
          console.error('Error with reCAPTCHA verification:', err)
        );

        const { data: entry } = await supabase
          .from('profiles')
          .update({
            signup_variant: variant,
            profile_app: profileApp,
          })
          .eq('id', data?.user?.id!)
          .select('*, patient!inner(*)')
          .single();

        if (specificCare === SpecificCareOption.SLEEP) {
          window.freshpaint?.track('account_created_insomnia');
        }
        if (specificCare === SpecificCareOption.PRIMARY_CARE) {
          window.freshpaint?.track('account_created_primary_care');
        }
        if (specificCare === SpecificCareOption.FEMALE_HAIR_LOSS) {
          window.freshpaint?.track('account_created_female_hair_loss');
        }

        if (Object.keys(query).some(key => key.startsWith('utm'))) {
          const dataForSupabase = retrieveUtmDataForSupabase(query, '');
          await insertDataIntoSupabase(dataForSupabase, data?.user?.id || '');
          const { data: profile }: any = await profileData(
            data?.user?.id || ''
          );
          window.freshpaint?.track(accountCreatedEvent, {
            email: data?.user?.email,
            care_selection:
              specificCare === 'Hair Loss' || query?.care === 'Hair Loss'
                ? 'Hair loss'
                : specificCare === 'Sex + Hair' || query?.care === 'Sex + Hair'
                ? 'Sex + Hair'
                : specificCare === 'Menopause' || query?.care === 'Menopause'
                ? 'Menopause'
                : specificCare || query?.care || 'None',
            care_type:
              variant === '4758' || variant === '4758b'
                ? flexibleCareType
                : variant === '5328'
                ? 'Weight Loss Ad'
                : variant?.includes('5674')
                ? mapVariantToCareType[variant!]
                : specificCare === 'Hair Loss'
                ? 'female hair loss'
                : specificCare === 'Hair loss'
                ? 'Hair loss men'
                : specificCare === 'Sex + Hair'
                ? 'Sex + Hair'
                : specificCare === 'Menopause'
                ? 'Menopause'
                : potentialInsurance ||
                  query?.ins ||
                  specificCare ||
                  query?.care ||
                  'None',
            first_utm_source: profile?.[0]?.utm_parameters?.[0]?.value,
            last_utm_source: profile?.[0]?.utm_parameters?.[1]?.value,
            first_utm_medium: profile?.[0]?.utm_parameters?.[2]?.value,
            last_utm_medium: profile?.[0]?.utm_parameters?.[3]?.value,
            first_utm_campaign: profile?.[0]?.utm_parameters?.[4]?.value,
            last_utm_campaign: profile?.[0]?.utm_parameters?.[5]?.value,
            first_utm_content: profile?.[0]?.utm_parameters?.[6]?.value,
            last_utm_content: profile?.[0]?.utm_parameters?.[7]?.value,
            first_utm_term: profile?.[0]?.utm_parameters?.[8]?.value,
            last_utm_term: profile?.[0]?.utm_parameters?.[9]?.value,
          });
          window.rudderanalytics?.track('account_created', {
            email: data?.user?.email,
            care_selection:
              specificCare === 'Hair Loss' || query?.care === 'Hair Loss'
                ? 'Hair loss'
                : specificCare === 'Sex + Hair' || query?.care === 'Sex + Hair'
                ? 'Sex + Hair'
                : specificCare === 'Menopause' || query?.care === 'Menopause'
                ? 'Menopause'
                : specificCare || query?.care || 'None',
            care_type:
              variant === '4758' || variant === '4758b'
                ? flexibleCareType
                : variant === '5328'
                ? 'Weight Loss Ad'
                : variant?.includes('5674')
                ? mapVariantToCareType[variant!]
                : specificCare === 'Hair Loss'
                ? 'female hair loss'
                : specificCare === 'Hair loss'
                ? 'Hair loss men'
                : specificCare === 'Sex + Hair'
                ? 'Sex + Hair'
                : specificCare === 'Menopause'
                ? 'Menopause'
                : potentialInsurance ||
                  query?.ins ||
                  specificCare ||
                  query?.care ||
                  'None',
            first_utm_source: profile?.[0]?.utm_parameters?.[0]?.value,
            last_utm_source: profile?.[0]?.utm_parameters?.[1]?.value,
            first_utm_medium: profile?.[0]?.utm_parameters?.[2]?.value,
            last_utm_medium: profile?.[0]?.utm_parameters?.[3]?.value,
            first_utm_campaign: profile?.[0]?.utm_parameters?.[4]?.value,
            last_utm_campaign: profile?.[0]?.utm_parameters?.[5]?.value,
            first_utm_content: profile?.[0]?.utm_parameters?.[6]?.value,
            last_utm_content: profile?.[0]?.utm_parameters?.[7]?.value,
            first_utm_term: profile?.[0]?.utm_parameters?.[8]?.value,
            last_utm_term: profile?.[0]?.utm_parameters?.[9]?.value,
          });
          window.freshpaint?.identify(data?.user?.id, {
            account_created_at: data?.user?.created_at,
            account_created_care_selection:
              specificCare || query?.care || 'None',
            converted: false,
            first_utm_source: profile?.[0]?.utm_parameters?.[0]?.value,
            last_utm_source: profile?.[0]?.utm_parameters?.[1]?.value,
            first_utm_medium: profile?.[0]?.utm_parameters?.[2]?.value,
            last_utm_medium: profile?.[0]?.utm_parameters?.[3]?.value,
            first_utm_campaign: profile?.[0]?.utm_parameters?.[4]?.value,
            last_utm_campaign: profile?.[0]?.utm_parameters?.[5]?.value,
            first_utm_content: profile?.[0]?.utm_parameters?.[6]?.value,
            last_utm_content: profile?.[0]?.utm_parameters?.[7]?.value,
            first_utm_term: profile?.[0]?.utm_parameters?.[8]?.value,
            last_utm_term: profile?.[0]?.utm_parameters?.[9]?.value,
          });
          window.freshpaint?.track('email_submitted', {
            email: data?.user?.email,
            care_selection:
              specificCare === 'Hair Loss' || query?.care === 'Hair Loss'
                ? 'Hair loss'
                : specificCare === 'Menopause' || query?.care === 'Menopause'
                ? 'Menopause'
                : specificCare || query?.care || 'None',
            care_type:
              variant === '4758' || variant === '4758b'
                ? flexibleCareType
                : variant === '5328'
                ? 'Weight Loss Ad'
                : variant?.includes('5674')
                ? mapVariantToCareType[variant!]
                : specificCare === 'Hair Loss'
                ? 'female hair loss'
                : specificCare === 'Hair loss'
                ? 'Hair loss men'
                : potentialInsurance ||
                  query?.ins ||
                  specificCare ||
                  query?.care ||
                  'None',
          });
          window.VWO?.event('account_created');
          await bmgAccountCreatedEvent(
            acEventName,
            data?.user?.email!,
            specificCare!,
            potentialInsurance!,
            profile?.utm_parameters,
            variant!
          );
          await bmgSignUpEvent(
            eventName,
            data?.user?.email!,
            specificCare!,
            potentialInsurance!,
            profile?.utm_parameters,
            variant!
          );
        } else {
          window.freshpaint?.track(accountCreatedEvent, {
            email: data?.user?.email,
            care_selection:
              specificCare === 'Hair Loss' || query?.care === 'Hair Loss'
                ? 'Hair loss'
                : specificCare === 'Sex + Hair' || query?.care === 'Sex + Hair'
                ? 'Sex + Hair'
                : specificCare === 'Menopause' || query?.care === 'Menopause'
                ? 'Menopause'
                : specificCare || query?.care || 'None',
            care_type:
              variant === '4758' || variant === '4758b'
                ? flexibleCareType
                : variant === '5328'
                ? 'Weight Loss Ad'
                : variant?.includes('5674')
                ? mapVariantToCareType[variant!]
                : specificCare === 'Hair Loss'
                ? 'female hair loss'
                : specificCare === 'Hair loss'
                ? 'Hair loss men'
                : specificCare === 'Sex + Hair'
                ? 'Sex + Hair'
                : specificCare === 'Menopause'
                ? 'Menopause'
                : potentialInsurance ||
                  query?.ins ||
                  specificCare ||
                  query?.care ||
                  'None',
          });
          window.freshpaint?.track('email_submitted', {
            email: data?.user?.email,
            care_selection:
              specificCare === 'Hair Loss' || query?.care === 'Hair Loss'
                ? 'Hair loss'
                : specificCare || query?.care || 'None',
            care_type:
              variant === '4758' || variant === '4758b'
                ? flexibleCareType
                : variant === '5328'
                ? 'Weight Loss Ad'
                : variant?.includes('5674')
                ? mapVariantToCareType[variant!]
                : specificCare === 'Hair Loss'
                ? 'female hair loss'
                : specificCare === 'Hair loss'
                ? 'Hair loss men'
                : potentialInsurance ||
                  query?.ins ||
                  specificCare ||
                  query?.care ||
                  'None',
          });
          window.freshpaint?.identify(data?.user?.id, {
            account_created_at: data?.user?.created_at,
            account_created_care_selection:
              specificCare ?? query?.care ?? 'None',
            converted: false,
          });
          window.VWO?.event('account_created');
        }
        // Only Pay of Prescribed Lead Freshpaint Events
        if (
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED &&
          variant === '5865'
        ) {
          window.freshpaint?.track(
            'weight-loss-lead-pay-if-prescribed-bundled',
            {
              email: data?.user?.email,
            }
          );
        } else if (
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          variant === '6471'
        ) {
          window.freshpaint?.track('weight-loss-lead-pay-if-prescribed', {
            email: data?.user?.email,
          });
        }
        // Add the STZ tracking event inside a Promise
        if (data?.user?.id) {
          window.STZ.trackEvent('AccountCreated', {
            profile_id: data.user.id,
          });
        }
        const { data: profile }: any = await profileData(data?.user?.id ?? '');

        //bmg360 events
        await bmgAccountCreatedEvent(
          acEventName,
          data?.user?.email!,
          specificCare!,
          potentialInsurance!,
          profile?.utm_parameters,
          variant!
        );
        await bmgSignUpEvent(
          eventName,
          data?.user?.email!,
          specificCare!,
          potentialInsurance!,
          profile?.utm_parameters,
          variant!
        );
      } catch (err) {
        console.error('Error in token generation:', err);
        // Don't block the main flow if reCAPTCHA has issues
      }
    }

    const { data: profile }: any = await profileData(data?.user?.id || '');

    if (!isSignUp && Object.keys(query).some(key => key.startsWith('utm'))) {
      const dataForSupabase = retrieveUtmDataForSupabase(
        query,
        profile?.[0]?.utm_parameters
      );

      await insertDataIntoSupabase(dataForSupabase, data?.user?.id || '');

      if (profile?.[0]?.utm_parameters?.length >= 10) {
        window.freshpaint?.identify(data?.user?.id, {
          first_utm_campaign: profile?.[0]?.utm_parameters?.[0]?.value,
          last_utm_campaign: profile?.[0]?.utm_parameters?.[1]?.value,
          first_utm_content: profile?.[0]?.utm_parameters?.[2]?.value,
          last_utm_content: profile?.[0]?.utm_parameters?.[3]?.value,
          first_utm_medium: profile?.[0]?.utm_parameters?.[4]?.value,
          last_utm_medium: profile?.[0]?.utm_parameters?.[5]?.value,
          first_utm_source: profile?.[0]?.utm_parameters?.[6]?.value,
          last_utm_source: profile?.[0]?.utm_parameters?.[7]?.value,
          first_utm_term: profile?.[0]?.utm_parameters?.[8]?.value,
          last_utm_term: profile?.[0]?.utm_parameters?.[9]?.value,
        });
      } else {
        window.freshpaint?.identify(data?.user?.id, {
          last_utm_campaign: profile?.[0]?.utm_parameters?.[0]?.value,
          last_utm_content: profile?.[0]?.utm_parameters?.[1]?.value,
          last_utm_medium: profile?.[0]?.utm_parameters?.[2]?.value,
          last_utm_source: profile?.[0]?.utm_parameters?.[3]?.value,
          last_utm_term: profile?.[0]?.utm_parameters?.[4]?.value,
        });
      }
    }

    if (
      referral?.referral?.specific_care === 'Weight loss' &&
      isSignUp &&
      (referral?.redeemed?.length ?? 0) < 5
    ) {
      await supabase.from('patient_referral_redeem').insert({
        profile_id: data?.user?.id,
        patient_referral_code: referral?.referral?.code,
      });

      const referrer = await supabase
        .from('patient_referral')
        .select('patient_id')
        .eq('code', referral?.referral?.code)
        .single();

      window.freshpaint?.track('referral_account_created', {
        email: data?.user?.email,
        care_selection: specificCare || query?.care || 'None',
        care_type:
          potentialInsurance ||
          query?.ins ||
          specificCare ||
          query?.care ||
          'None',
        referrer_patient_id: referrer?.data?.patient_id,
      });
    }

    if (isSignUp && code?.active && data?.user?.id) {
      const coupon = await supabase
        .from('coupon_code_redeem')
        .insert({ profile_id: data?.user?.id, code: code?.code });
      console.log(coupon, 'coup');
    }

    if (error) {
      const message = (error as Error).message.includes(
        'abcdefghijklmnopqrstuvwxyz'
      )
        ? language === 'esp'
          ? 'Tu contraseña debe tener al menos 8 caracteres, contener al menos un número, un carácter especial y una combinación de letras mayúsculas y minúsculas.'
          : 'Your password must be at least 8 characters long, contain at least one number, a special character, and have a mixture of uppercase and lowercase letters.'
        : (error as Error).message;

      setError(message);
      setLoading(false);
      return false;
    }

    if (isSignUp && specificCare === SpecificCareOption.SKINCARE) {
      Router.push(Pathnames.SKINCARE_SELECTION);
      return;
    }

    function onSignOut() {
      Router.push(Pathnames.LOG_OUT);
    }

    if (
      !isSignUp &&
      data &&
      profile.length &&
      Object.values(ProfileApp).includes(profile[0]?.profile_app) &&
      profile[0]?.profile_app !== profileApp
    ) {
      onSignOut();
      await handleMagicLink(
        email ?? '',
        getRedirectUrl(profile[0]?.profile_app as ProfileApp)
      );
      return;
    } else {
      !!data && Router.push(nextRoute);
    }
  };

  const insertDataIntoSupabase = async (utmData: any, id: string) => {
    const formattedUtmData: any = Object.entries(utmData).map(
      ([key, value]) => ({ key, value })
    );

    const { data, error } = await supabase
      .from('profiles')
      .update({ utm_parameters: formattedUtmData })
      .eq('id', id);

    if (error) {
      console.error('Error inserting data into Supabase:', error);
    } else {
      console.log('Data inserted successfully', data);
    }
  };

  useEffect(() => {
    Router.prefetch(nextRoute);
  }, [Router, nextRoute]);

  useEffect(() => {
    if (referral?.referral?.specific_care === 'Weight loss') {
      addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    }
  }, [referral]);

  let contGoogle = 'Continue with Google';
  let contApple = 'Continue with Apple';
  let contFacebook = 'Continue with Facebook';
  let emailAdd = 'Email address';
  let contEmail = 'Continue with email';
  let contLogin = 'Log in';

  let contPassword = 'Password';
  let createPassword = 'Create a password';

  if (language === 'esp') {
    contGoogle = 'Continua con Google';
    contFacebook = 'Continua con Facebook';
    contApple = 'Continua con Apple';
    emailAdd = 'direcction de correo';
    contEmail = 'Continua con email';
    contLogin = 'Iniciar sesión';
    contPassword = 'Contraseña';
    createPassword = 'Crea una contraseña';
  }

  const handleSubmit: FormEventHandler = async e => {
    e.preventDefault();
    return onSubmit(e as FormEvent<HTMLFormElement>);
  };

  return (
    <StackDynamic gap="3rem">
      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
        <>
          <StackDynamic gap="1rem">
            <Button
              onClick={() => signInWithOAuth('apple')}
              variant="outlined"
              size="small"
              style={{
                backgroundColor: '#fff',
                border: '0.5px solid #D8D8D8',
                color: '#000',
              }}
              startIcon={<AppleLogoDynamic />}
            >
              {contApple}
            </Button>
            <Button
              onClick={() => signInWithOAuth('facebook')}
              variant="outlined"
              size="small"
              style={{
                backgroundColor: '#fff',
                border: '0.5px solid #D8D8D8',
                color: '#000',
              }}
              startIcon={<FacebookLogoDynamic />}
            >
              {contFacebook}
            </Button>
            <Button
              onClick={() => signInWithOAuth('google')}
              variant="outlined"
              size="small"
              startIcon={<GoogleLogoDynamic />}
              style={{
                backgroundColor: '#fff',
                border: '0.5px solid #D8D8D8',
                color: '#000',
              }}
            >
              {contGoogle}
            </Button>
          </StackDynamic>
          <DividerDynamic>or</DividerDynamic>
        </>
      )}

      <BoxDynamic
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <FormControlDynamic variant="filled" fullWidth required>
          <InputLabelDynamic htmlFor="filled-adornment-email">
            {emailAdd}
          </InputLabelDynamic>
          <FilledInputDynamic
            fullWidth
            disableUnderline={true}
            value={email}
            autoComplete="username"
            id="filled-adornment-email"
            onChange={e => setEmail(e.target.value)}
            required
          />
        </FormControlDynamic>
        <FormControlDynamic variant="filled" fullWidth required>
          <InputLabelDynamic htmlFor="filled-adornment-password">
            {isSignUp ? createPassword : contPassword}
          </InputLabelDynamic>
          <FilledInputDynamic
            value={password}
            disableUnderline={true}
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
            id="filled-adornment-password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButtonDynamic
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{
                    marginRight: 0,
                  }}
                >
                  {showPassword ? (
                    <VisibilityDynamic />
                  ) : (
                    <VisibilityOffDynamic />
                  )}
                </IconButtonDynamic>
              </InputAdornment>
            }
          />
        </FormControlDynamic>
        {error ? (
          <CustomText color="red" textAlign="center">
            {error.toString()}
          </CustomText>
        ) : null}
        {window.grecaptcha.enterprise ? (
          <LoadingButton type="submit" loading={loading}>
            {isSignUp ? contEmail : contLogin}
          </LoadingButton>
        ) : (
          <Spinner />
        )}
      </BoxDynamic>
    </StackDynamic>
  );
};

SignUpFormComponent.displayName = 'SignUpForm';

const SignUpForm = memo(SignUpFormComponent);

export default SignUpForm;
