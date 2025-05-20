import Router from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { Provider } from '@supabase/supabase-js';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Visibility from '@mui/icons-material/VisibilityOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { Database } from '@/lib/database.types';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { CouponCode } from '@/components/hooks/data';
import retrieveUtmDataForSupabase from '@/utils/retrieveUtmData';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import AppleLogo from '@/components/shared/SSOSignUp/assets/AppleLogo';
import FacebookLogo from '@/components/shared/SSOSignUp/assets/FacebookLogo';
import GoogleLogo from '@/components/shared/SSOSignUp/assets/GoogleLogo';
import CustomText from '@/components/shared/Text';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import getConfig from '../../../../config';
import { trackWithDeduplication } from '@/utils/freshpaint/utils';

interface SignUpFormProps {
  isSignUp: boolean;
  nextRoute: string;
  referral?: any;
  code?: CouponCode;
}

const SignUpForm = ({
  isSignUp,
  nextRoute,
  referral,
  code,
}: SignUpFormProps) => {
  const { accountCreatedEvent } = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient<Database>();
  const { query } = Router;
  const handleClickShowPassword = () => setShowPassword(show => !show);
  const { specificCare, potentialInsurance } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isEmailValid = emailRegex.test(email);

  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const profileData = async (profileId: string) => {
    return await supabase.from('profiles').select('*').eq('id', profileId);
  };

  useEffect(() => {
    if (specificCare && specificCare == 'Weight loss') {
      trackWithDeduplication('weight-loss-sign-up');
    }
  }, [specificCare]);

  async function signInWithOAuth(provider: Provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    let result = !isSignUp
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    const { data, error } = result;

    if (data && isSignUp) {
      if (Object.keys(query).some(key => key.startsWith('utm'))) {
        const dataForSupabase = retrieveUtmDataForSupabase(query, '');
        await insertDataIntoSupabase(dataForSupabase, data?.user?.id || '');
        const { data: profile }: any = await profileData(data?.user?.id || '');

        // Tracking code with UTM parameters
        window.freshpaint?.track(accountCreatedEvent, {
          email: data?.user?.email,
          care_selection: specificCare || query?.care || 'None',
          care_type:
            potentialInsurance ||
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
          care_selection: specificCare || query?.care || 'None',
          care_type:
            potentialInsurance ||
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
        window.freshpaint?.track('email_submitted', {
          email: data?.user?.email,
          care_selection: specificCare || query?.care || 'None',
          care_type:
            potentialInsurance ||
            query?.ins ||
            specificCare ||
            query?.care ||
            'None',
        });

        window.freshpaint?.identify(data?.user?.id, {
          account_created_at: data?.user?.created_at,
          account_created_care_selection: specificCare || query?.care || 'None',
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
      } else {
        // Tracking code without UTM parameters
        window.freshpaint?.track(accountCreatedEvent, {
          email: data?.user?.email,
          care_selection: specificCare || query?.care || 'None',
          care_type:
            potentialInsurance ||
            query?.ins ||
            specificCare ||
            query?.care ||
            'None',
        });
        window.rudderanalytics?.track('account_created', {
          email: data?.user?.email,
          care_selection: specificCare || query?.care || 'None',
          care_type:
            potentialInsurance ||
            query?.ins ||
            specificCare ||
            query?.care ||
            'None',
        });
        window.freshpaint?.track('email_submitted', {
          email: data?.user?.email,
          care_selection: specificCare || query?.care || 'None',
          care_type:
            potentialInsurance ||
            query?.ins ||
            specificCare ||
            query?.care ||
            'None',
        });

        window.freshpaint?.identify(data?.user?.id, {
          account_created_at: data?.user?.created_at,
          account_created_care_selection: specificCare || query?.care || 'None',
          converted: false,
        });
      }

      // Fire the VWO 'account_created' event unconditionally
      window.VWO?.event('account_created');

      if (data?.user?.id) {
        window.STZ.trackEvent('AccountCreated', {
          profile_id: data.user.id,
        });
      }

      Router.push(nextRoute);
    }

    if (data && !isSignUp) {
      const { data: profile }: any = await profileData(data?.user?.id || '');
      if (Object.keys(query).some(key => key.startsWith('utm'))) {
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

      // Redirect the user after login
      Router.push(nextRoute);
    }

    // Handle referrals and coupons (if any)
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
      setError(error.message);
      setLoading(false);
      return false;
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

  return (
    <Stack gap="3rem">
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="filled-adornment-email">
            Email address
          </InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={email}
            autoComplete="username"
            id="filled-adornment-email"
            onChange={e => setEmail(e.target.value)}
            required
          />
        </FormControl>
        {isEmailValid ? (
          <FormControl variant="filled" fullWidth required>
            <InputLabel htmlFor="filled-adornment-password">
              {isSignUp ? 'Create a password' : 'Password'}
            </InputLabel>
            <FilledInput
              value={password}
              disableUnderline={true}
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
              id="filled-adornment-password"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{
                      marginRight: 0,
                    }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        ) : null}
        {error ? (
          <CustomText color="red" textAlign="center">
            {error.toString()}
          </CustomText>
        ) : null}
        <Typography variant="body1" style={{ marginBottom: 20 }}>
          By proceeding, I confirm that I am over 18 years old and agree to
          Zealthy&#x27;s{' '}
          <Link
            href="https://www.getzealthy.com/terms-of-use/"
            underline="none"
            color="primary"
          >
            Terms
          </Link>
          {' and '}
          <Link
            href="https://www.getzealthy.com/privacy-policy/"
            underline="none"
            color="primary"
          >
            Privacy Policy
          </Link>
        </Typography>
        <LoadingButton type="submit" loading={loading}>
          View your results
        </LoadingButton>
      </Box>

      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
        <>
          <Divider>or</Divider>
          <Stack gap="1rem">
            <Button
              onClick={() => signInWithOAuth('google')}
              variant="outlined"
              size="small"
              startIcon={<GoogleLogo />}
              style={{
                backgroundColor: '#fff',
                border: '0.5px solid #D8D8D8',
                color: '#000',
              }}
            >
              Continue with Google
            </Button>
            <Button
              onClick={() => signInWithOAuth('apple')}
              variant="outlined"
              size="small"
              style={{
                backgroundColor: '#fff',
                border: '0.5px solid #D8D8D8',
                color: '#000',
              }}
              startIcon={<AppleLogo />}
            >
              Continue with Apple
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
              startIcon={<FacebookLogo />}
            >
              Continue with Facebook
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default SignUpForm;
