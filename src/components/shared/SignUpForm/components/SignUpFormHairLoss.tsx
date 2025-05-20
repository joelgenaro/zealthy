import Router from 'next/router';
import { FormEvent, useEffect, useState, useCallback } from 'react';
import { Provider } from '@supabase/supabase-js';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Box,
  Button,
  Divider,
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/VisibilityOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { Pathnames } from '@/types/pathnames';
import { SubmitAnswersParams } from '@/types/api/submit-answers';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import { usePatientActions } from '@/components/hooks/usePatient';
import { Endpoints } from '@/types/endpoints';
import { useApi } from '@/context/ApiContext';
import { useAnswerState } from '@/components/hooks/useAnswer';
import AppleLogo from '../../SSOSignUp/assets/AppleLogo';
import FacebookLogo from '../../SSOSignUp/assets/FacebookLogo';
import GoogleLogo from '../../SSOSignUp/assets/GoogleLogo';
import CustomText from '../../Text';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useIntakeState } from '@/components/hooks/useIntake';
import { Database } from '@/lib/database.types';
import getConfig from '../../../../../config';

interface SignUpFormProps {
  isSignUp: boolean;
}

const SignUpFormHairLoss = ({ isSignUp }: SignUpFormProps) => {
  const { accountCreatedEvent } = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  );

  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient<Database>();
  const handleClickShowPassword = () => setShowPassword(show => !show);
  const { updateVisit } = useVisitActions();
  const { updatePatient } = usePatientActions();
  const { medications } = useVisitState();
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const api = useApi();
  const answers = useAnswerState();
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const getHairLossCare = useCallback(async () => {
    return supabase
      .from('reason_for_visit')
      .select('id, reason, synchronous')
      .eq('reason', 'Hair loss')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);
  }, [supabase]);

  const createVisitForCareSelection = useCallback(
    async (patientId: number) => {
      const hairLossCare = await getHairLossCare();

      const onlineVisit = await supabase
        .from('online_visit')
        .insert({
          patient_id: patientId,
          synchronous: false,
          status: 'Created',
          specific_care: specificCare,
          potential_insurance: potentialInsurance,
          variant,
        })
        .select('*')
        .maybeSingle()
        .then(({ data }) => data);

      if (onlineVisit && hairLossCare) {
        await supabase.from('visit_reason').insert([
          {
            visit_id: onlineVisit.id,
            reason_id: hairLossCare.id,
          },
        ]);

        updateVisit({
          id: onlineVisit.id,
          isSync: onlineVisit.synchronous,
          intakes: [],
          selectedCare: {
            careSelections: [hairLossCare],
            other: '',
          },
          questionnaires: [],
          medications,
        });

        updatePatient({
          id: patientId,
        });

        //submit answers
        api.post(Endpoints.SUBMIT_ANSWERS, {
          visitId: onlineVisit.id,
          canvasId: '',
          questionnaireName: 'hair-loss',
          newAnswers: Object.values(answers).filter(
            ans => ans.questionnaire === 'hair-loss'
          ),
          codingSystem: '',
        } as SubmitAnswersParams);
      }
    },
    [
      answers,
      api,
      getHairLossCare,
      medications,
      supabase,
      updatePatient,
      updateVisit,
    ]
  );

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
      window.freshpaint?.track(accountCreatedEvent, {
        email: data?.user?.email,
        care_selection: SpecificCareOption.HAIR_LOSS,
        care_type: SpecificCareOption.HAIR_LOSS,
      });
      window.rudderanalytics?.track('account_created', {
        email: data?.user?.email,
        care_selection: SpecificCareOption.HAIR_LOSS,
        care_type: SpecificCareOption.HAIR_LOSS,
      });
      window.freshpaint?.track('email_submitted', {
        email: data?.user?.email,
        care_selection: SpecificCareOption.HAIR_LOSS,
        care_type: SpecificCareOption.HAIR_LOSS,
      });
      window.VWO?.event('account_created');
      if (data?.user?.id) {
        window.STZ.trackEvent('AccountCreated', {
          profile_id: data.user.id,
        });
      }
    }

    if (data.user) {
      // create patient
      const patient = await supabase
        .from('patient')
        .insert({ profile_id: data.user.id })
        .select('id')
        .maybeSingle()
        .then(({ data }) => data);

      //create visit
      if (patient) {
        await createVisitForCareSelection(patient.id);
      }

      //redirect to selected treatment
      Router.replace(Pathnames.HAIR_LOSS_SELECT_TREATMENT);
      return;
    }

    setError(error?.message || 'Something went wrong. Please try again.');
    setLoading(false);
    return;
  };

  useEffect(() => {
    Router.prefetch(Pathnames.HAIR_LOSS_SELECT_TREATMENT);
  }, []);

  return (
    <Stack gap={isMobile ? '2rem' : '3rem'}>
      <Stack gap="1rem">
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
      </Stack>
      <Divider>or</Divider>
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
        {error ? (
          <CustomText color="red" textAlign="center">
            {error.toString()}
          </CustomText>
        ) : null}
        <LoadingButton type="submit" loading={loading}>
          {isSignUp ? 'Continue with email' : 'Log in'}
        </LoadingButton>
      </Box>
    </Stack>
  );
};

export default SignUpFormHairLoss;
