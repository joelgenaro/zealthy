import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import {
  Box,
  IconButton,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import RoundButton from '../../Button/RoundButton';
import { Pathnames } from '@/types/pathnames';
import {
  useLanguage,
  usePatient,
  useVWOVariationName,
} from '@/components/hooks/data';
import ProgressBarV2 from '../../ProgressBarV2';
import { useAnswerState } from '@/components/hooks/useAnswer';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import { useEffect, useState } from 'react';
import { useFlowActions, useFlowState } from '@/components/hooks/useFlow';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Logo from '@/components/shared/icons/Logo';
import ProgressBar from '../../ProgressBar';
import { mapQuestionnaireToCare } from '@/utils/mapCareToQuestionnaire';
import { QuestionnaireName } from '@/types/questionnaire';
import { usePathname } from 'next/navigation';
import { usePatientState } from '@/components/hooks/usePatient';

interface WrapperProps {
  bgcolor: string;
  variation4289enc?: string | undefined;
  theme: any;
}

const Wrapper = styled(Box)(({ theme }: WrapperProps) => ({
  padding: '0 16px',
  height: '108px',
  borderBottom: '1px solid #777777',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  backgroundColor: theme.palette.background.paper,

  a: {
    color: 'inherit',
  },

  '.back-btn': {
    position: 'absolute',
    left: '40px',
  },

  '.sign-out-btn': {
    position: 'absolute',
    right: '40px',
  },

  [theme.breakpoints.down('md')]: {
    '.back-btn': {
      left: '16px',
    },
    '.sign-out-btn': {
      right: '16px',
    },
  },

  [theme.breakpoints.down('sm')]: {
    height: '48px',
    backgroundColor: theme.palette.background.default,
    borderBottom: 'none',
    '.back-btn': {
      left: '12px',
    },
    '.sign-out-btn': {
      display: 'none',
    },
    '.logo': {
      display: 'none',
    },
  },
  [theme.breakpoints.between(1, 400)]: {
    height: '48px',
    backgroundColor: theme.palette.background.default,
    borderBottom: 'none',
    '.back-btn': {
      left: '5px',
    },
    '.sign-out-btn': {
      display: 'none',
    },
    '.logo': {
      display: 'none',
    },
  },
}));

const NavSpacer = styled(Box)(({ theme }: WrapperProps) => ({
  height: '108px', // Same as your nav height
  [theme.breakpoints.down('sm')]: {
    height: '48px', // Match your mobile nav height
  },
}));

interface Props {
  back?: string;
}

const OnboardingNav = ({ back }: Props) => {
  const theme = useTheme();
  const supabase = useSupabaseClient();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: patient } = usePatient();
  const answers = useAnswerState();
  const { currentFlow } = useFlowState();
  const { setFlow } = useFlowActions();
  const language = useLanguage();
  const router = useRouter();
  const vwoContext = useVWO();
  const { data: variation4918 } = useVWOVariationName('4918');
  const { data: variation6337 } = useVWOVariationName('6337');
  const { data: variation8201 } = useVWOVariationName('8201');
  const [variation15618, setVariation15618] = useState<string | undefined>();
  const variation4624 = ['CA', 'FL', 'TX'].includes(patient?.region!)
    ? vwoContext.getVariationName('4624', String(patient?.id))
    : '';

  const { name, question_name } = router.query;

  const { specificCare, potentialInsurance } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const isPost = pathname?.includes('post-checkout');

  const questions = [
    'WEIGHT_LOSS_CHECKOUT_S_Q1',
    'WEIGHT_LOSS_BOR-Q1',
    ...Object.keys(answers).filter(q => q.includes('POST')),
  ];
  const get8061BackPath = () => {
    const current = pathname?.split('/').pop();
    if (current === 'WEIGHT_LOSS_BOR-Q1') {
      return '/post-checkout/questionnaires-v2/weight-loss-checkout-success/WEIGHT_LOSS_CHECKOUT_S_Q1';
    }

    return `/post-checkout/questionnaires-v2/weight-loss-post-v2/${
      questions[questions.indexOf(pathname?.split('/').pop()!) - 1] ||
      questions[questions.length - 1]
    }`;
  };
  const activateVariant = async () => {
    // ED Progress bar A/B test
    // https://app.vwo.com/#/full-stack/server-ab/390/summary
    // AZ, CA, CO, CT, FL, GA, UT, OK
    if (
      patient?.profiles.first_name &&
      ['AZ', 'CA', 'CO', 'CT', 'FL', 'GA', 'UT', 'OK'].includes(
        patient.region as string
      ) &&
      currentFlow === 'ed'
    ) {
      const variationName = await vwoContext?.activate('15618', patient);
      setVariation15618(variationName as string);
    } else if (patient) {
      setLoading(false);
    }
  };

  useEffect(() => {
    activateVariant();
  }, [vwoContext, patient?.profiles.first_name, patient?.region, currentFlow]);

  useEffect(() => {
    if (variation15618 === 'Variation-1' || variation15618 === 'Control') {
      setLoading(false);
    }
  }, [variation15618]);

  useEffect(() => {
    if (router.query['ins'] === 'Semaglutide Bundled') {
      setFlow('sema-bundled');
    }
    if (
      router.query['name'] === 'ed' ||
      router.query['name'] === 'ed-hardies'
    ) {
      setFlow('ed');
    }
  }, [router.query]);

  const isBundledFlow = [
    PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
    PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
  ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT);

  function onSignOut() {
    Router.push(Pathnames.LOG_OUT);
  }

  const specificProgressMap: { [key: string]: number } = {
    'onboarding/region-screen': 1,
    'onboarding/age-screen': 2,
    'onboarding/complete-profile': 3,
    checkout: 100,
    'what-next': 97,
    'post-checkout/complete-visit': 100,
    'post-checkout/prep-complete': 100,
  };

  const weightLossPathnames = [
    'questionnaires-v2',
    'what-next',
    'checkout',
    'post-checkout/complete-visit',
  ];

  const variation4624Omit = ['/checkout', '/what-next'];
  const pagesToOmit = [
    'onboarding/region-screen',
    'onboarding/region-screen-2',
    'onboarding/age-screen',
    'onboarding/complete-profile',
    'visit/care-selection',
    'post-checkout/questionnaires-v2/now-what-7380/NOW-WHAT-A-Q1',
  ];
  const pagesToOmit6819 = [
    'visit/care-selection',
    'post-checkout/questionnaires-v2/now-what-7380/NOW-WHAT-A-Q1',
  ];
  const questionnairesToOmit = [
    'full-body-photo',
    'responses-reviewed',
    'live-provider-visit',
  ];

  useEffect(() => {
    if (!specificCare) {
      const careType = mapQuestionnaireToCare(name as QuestionnaireName);
      if (
        Router.asPath.includes('post-checkout') &&
        name?.includes('vouched')
      ) {
        addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
      } else if (careType) {
        addSpecificCare(careType);
      }
    }
  }, [name]);

  const isVariation6819 = router.query.variant === '6819';

  const getProgressBar = () => {
    // if loading or on pages to omit progress bar
    if (
      loading ||
      variation4624Omit.includes(router.pathname) ||
      (!isVariation6819 &&
        pagesToOmit.some(path => router.pathname.includes(path))) ||
      (isVariation6819 &&
        pagesToOmit6819.some(path => router.pathname.includes(path))) ||
      questionnairesToOmit.includes(name as string)
    ) {
      return null;
    } else if (
      // Use new progress bar for certain flows
      currentFlow === 'sema-bundled' ||
      variation15618 === 'Variation-1' ||
      ([
        'Weight loss',
        'Hair Loss',
        'Enclomiphene',
        'Skincare',
        'Acne',
        'Hyperpigmentation Dark Spots',
        'Fine Lines & Wrinkles',
        'Rosacea',
        'Prep',
        'Sleep',
        'Weight Loss Free Consult',
      ]?.includes(specificCare || '') &&
        !isBundledFlow)
    ) {
      return (
        <ProgressBarV2
          answers={answers}
          specificProgress={
            specificProgressMap[
              router.pathname.slice(router.pathname.indexOf('/') + 1)
            ]
          }
        />
      );
    }
    // else show old progress bar
    else {
      return <ProgressBar />;
    }
  };

  const handleExit = async () => {
    // if (variation6337?.variation_name === 'Variation-3') {
    //   await supabase.from('patient_action_item').insert({
    //     type: 'CONTINUE_WEIGHT_LOSS',
    //     patient_id: patient?.id,
    //     title:
    //       'Complete the following questions to get your insurance to approve GLP-1 medication',
    //     body: 'Answer a few questions to have your care team submit a Prior Authorization to have your insurance pay for your GLP-1 medication.',
    //     is_required: true,
    //   });
    // }
    Router.push(Pathnames.PATIENT_PORTAL);
  };

  const notAllowGoBack = [
    'WEIGHT_LOSS_CHECKOUT_S_Q1',
    'IDENTITY-V-Q1',
    'WEIGHT_LOSS_COMPLETE-Q1',
    'RESPONSES-REVIEWED-A-Q1',
    'LIVE_PV_Q1',
  ];

  useEffect(() => {
    window.scrollTo(0, 0);

    const handlePopState = () => {
      history.go(1);
    };

    if (router.asPath.includes('WEIGHT_LOSS_CHECKOUT_S_Q1')) {
      window.onpopstate = handlePopState;
    } else {
      window.onpopstate = null;
    }

    return () => {
      window.onpopstate = null;
    };
  }, [router.asPath]);

  const getParentQuestionName = (questionName: string) => {
    //question's that end with _A1, _A2, etc., return the parent question name
    const match = questionName.match(/^(.+)_A\d+$/);
    return match ? match[1] : questionName;
  };

  const handleBack = () => {
    if (name && question_name) {
      const stateString = sessionStorage.getItem('zealthy-app-state');

      if (stateString) {
        try {
          const state = JSON.parse(stateString);
          const questionKeys = Object.keys(state)
            .filter(key => key.startsWith(`${name}_`))
            .map(key => key.split('_').slice(1).join('_'));

          const currentQuestionName = getParentQuestionName(
            question_name as string
          );
          const currentQuestionIndex =
            questionKeys.indexOf(currentQuestionName);

          if (currentQuestionIndex > 0) {
            const previousQuestion = questionKeys[currentQuestionIndex - 1];
            return Router.push(
              `/questionnaires-v2/${name}/${previousQuestion}`
            );
          }
        } catch (error) {
          console.error('Error parsing session storage:', error);
        }
      }
    }

    Router.back();
  };

  return (
    <>
      <Wrapper theme={theme} bgcolor={theme.palette.background.paper}>
        <IconButton className="back-btn" onClick={handleBack}>
          {isMobile ? (
            <ArrowBackIosIcon sx={{ fontSize: '1rem' }} />
          ) : (
            <ArrowBackIcon />
          )}
        </IconButton>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={isMobile ? 0.2 : 2}
        >
          <Link
            href={
              patient?.status === 'ACTIVE' && patient?.has_completed_onboarding
                ? Pathnames.PATIENT_PORTAL
                : '/'
            }
            className="logo"
          >
            <Logo />
          </Link>
          {getProgressBar()}
        </Box>
        {patient?.has_completed_onboarding ? (
          <RoundButton
            className="sign-out-btn"
            style={{
              display: 'inline',
              paddingRight: isMobile ? '0px' : '24px',
              marginRight: isMobile ? '-10px' : '24px',
              paddingTop: isMobile ? '5px' : '0px',
            }}
            variant="text"
            onClick={handleExit}
          >
            X
          </RoundButton>
        ) : (
          <RoundButton
            className="sign-out-btn"
            variant="text"
            onClick={onSignOut}
          >
            {language === 'esp' ? 'Cerrar sesión' : 'Sign Out'}
          </RoundButton>
        )}
      </Wrapper>
      <NavSpacer theme={theme} bgcolor={theme.palette.background.paper} />
    </>
  );
};

export default OnboardingNav;
