import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import Image from 'next/image';
import Router from 'next/router';
import {
  useCouponCode,
  usePatientReferral,
  useLanguage,
} from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import { useEffect, useMemo, memo } from 'react';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import SkincareSignupImage from 'public/images/skincare/cream-girl.png';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import getConfig from '../../../../config';

const { name: siteName, domain } = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
);

// Dynamically import heavy components
const Container = dynamic(() => import('@mui/material/Container'), {
  ssr: true,
});
const Grid = dynamic(() => import('@mui/material/Grid'), { ssr: true });
const Typography = dynamic(() => import('@mui/material/Typography'), {
  ssr: true,
});
const Stack = dynamic(() => import('@mui/material/Stack'), { ssr: true });
const Link = dynamic(() => import('@mui/material/Link'), { ssr: true });
const SignUpForm = dynamic(() => import('../../shared/SignUpForm'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '300px' }} />,
});

interface SignUpProps {
  siteName: string;
}

const getHeader = (
  care: PotentialInsuranceOption | SpecificCareOption | null
) => {
  switch (care) {
    case PotentialInsuranceOption.MEDICAID_ACCESS_FLORIDA:
    case PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA:
      return "You're on your way to lasting weight loss.";
    case PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED:
      return `Let's see if Semaglutide with ${siteName} is right for you.`;
    case PotentialInsuranceOption.TIRZEPATIDE_BUNDLED:
      return `Let's see if Tirzepatide with ${siteName} is right for you.`;
    case SpecificCareOption.WEIGHT_LOSS:
      return "You're on your way to lasting weight loss.";
    case SpecificCareOption.WEIGHT_LOSS_AD:
      return "You're on your way to lasting weight loss.";
    case SpecificCareOption.ASYNC_MENTAL_HEALTH:
      return "You're on your way to better mental health.";
    case SpecificCareOption.ENCLOMIPHENE:
      return [
        'Get started on your enclomiphene treatment plan to double your testosterone.',
      ];
    case SpecificCareOption.BIRTH_CONTROL:
      return ['Easy to get birth control is finally here with free delivery.'];
    case SpecificCareOption.ANXIETY_OR_DEPRESSION:
      return [
        'A prescription plan for those experiencing symptoms of anxiety or depression.',
      ];
    case SpecificCareOption.SKINCARE:
      return ['Clearer skin within reach!'];
    case SpecificCareOption.FEMALE_HAIR_LOSS:
      return ['See thicker, fuller hair in as little as 3-6 months.'];
    case SpecificCareOption.PRE_WORKOUT:
      return ['Boost your performance in the gym and in the bedroom.'];
    case SpecificCareOption.ANTI_AGING:
    case SpecificCareOption.MELASMA:
    case SpecificCareOption.ROSACEA:
    case SpecificCareOption.ACNE:
      return "You're on your way to better skin.";
    default:
      return `You're on your way to better health.`;
  }
};

const getDescription = (
  care: PotentialInsuranceOption | SpecificCareOption | null,
  variant: string | null
) => {
  if (variant && variant === '5267v') {
    return [
      `Let's see if ${siteName} is right for you.`,
      "Create a free account to see if you're eligible for our weight loss program, or any other program you might be interested in.",
    ];
  }

  switch (care) {
    case PotentialInsuranceOption.MEDICAID_ACCESS_FLORIDA:
    case PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA:
      return [
        "Let's see if Z-Plan by Zealthy is right for you.",
        'Create a free account to learn more.',
      ];
    case SpecificCareOption.ASYNC_MENTAL_HEALTH:
      return [
        "Let's dive in by creating a free account and answering questions about how you've been feeling, so that we can get you started on the right treatment plan and you can start feeling like yourself again.",
      ];
    case SpecificCareOption.ENCLOMIPHENE:
      return [
        "In order to make sure we are able to provide you with treatment, you'll need to create a free account and then share your age and location (where labs and medication will be shipped, if qualified).",
      ];
    case SpecificCareOption.BIRTH_CONTROL:
      return [
        "Create a free account to see if you're eligible. We'll ask a few questions about your medication so that you can get prescribed without an appointment and have the right birth control for you delivered to your door.",
      ];
    case SpecificCareOption.ANXIETY_OR_DEPRESSION:
      return [
        'Create a free account today to unlock your limited time offer of 60% off your first month plus medication shipped.',
      ];
    case SpecificCareOption.SKINCARE:
      return [
        'Create a free account today to receive a customized prescription treatment plan for your skin.',
      ];
    case SpecificCareOption.FEMALE_HAIR_LOSS:
      return [
        'Create a free account today to receive a customized prescription treatment plan for your hair.',
      ];
    case SpecificCareOption.PRE_WORKOUT:
      return [
        "Create a free account to see if you're eligible and get a treatment plan that will help with better pumps for your workouts and also help you achieve faster, longer lasting erections.",
      ];
    case SpecificCareOption.SLEEP:
      return [
        "Let's see if Rozerem (Ramelteon) is right for you and your sleep.",
        'Create a free account to learn more.',
      ];

    default:
      return [
        `Let's see if ${siteName} is right for you.`,
        'Create a free account to learn more.',
      ];
  }
};

const getImage = (
  care: PotentialInsuranceOption | SpecificCareOption | null
) => {
  if (care === SpecificCareOption.SKINCARE) {
    return SkincareSignupImage;
  }
  return null;
};

const SignUpComponent = () => {
  const language = useLanguage();
  const isMobile = useIsMobile();
  const { push, query } = Router;
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { addSpecificCare, addPotentialInsurance, addVariant } =
    useIntakeActions();
  const { data: referral } = usePatientReferral(query.code);
  const { data: code } = useCouponCode(query.code);

  // Memoize query effects
  useEffect(() => {
    if (specificCare && !query.care) {
      push({ query: { care: specificCare } }, undefined, {
        shallow: true,
      });
    } else if (
      !specificCare &&
      Object.values(SpecificCareOption).includes(
        query.care as SpecificCareOption
      )
    ) {
      addSpecificCare(query.care as SpecificCareOption);
    }

    if (
      !potentialInsurance &&
      Object.values(PotentialInsuranceOption).includes(
        query.ins as PotentialInsuranceOption
      )
    ) {
      addPotentialInsurance(query.ins as PotentialInsuranceOption);
    }

    if (!variant && query.variant) {
      addVariant(query.variant as string);
    }
  }, [
    specificCare,
    addSpecificCare,
    potentialInsurance,
    addPotentialInsurance,
    variant,
    addVariant,
    query,
    push,
  ]);

  // Memoize weight loss redirect
  useEffect(() => {
    if (variant === '4438' && query.care === 'Weight loss') {
      push({ pathname: 'weight-loss-ro', query: { variant } });
    }
  }, [variant, query.care]);

  // Memoize computed values
  const { header, description, SigUpImage } = useMemo(
    () => ({
      header: getHeader(potentialInsurance || specificCare),
      description: getDescription(potentialInsurance || specificCare, variant),
      SigUpImage: isMobile ? getImage(specificCare) : null,
    }),
    [potentialInsurance, specificCare, variant, isMobile]
  );

  // Store UTM parameters
  useEffect(() => {
    if (Object.keys(query).some(key => key.startsWith('utm'))) {
      Object.entries(query).forEach(([key, value]) => {
        if (typeof value === 'string') {
          sessionStorage.setItem(key, value);
        }
      });
    }
  }, [query]);

  // Memoize text content
  const textContent = useMemo(() => {
    if (specificCare === 'Weight loss' && language === 'esp') {
      return {
        header: 'Estás en camino hacia una pérdida de peso duradera.',
        description: [
          `Veamos si ${siteName} es adecuado para ti.`,
          'Crea una cuenta gratuita para obtener más información.',
        ],
        confirm:
          'Al continuar, confirmo que soy mayor de 18 años y acepto los términos de ',
        terms: 'Terminos ',
        and: ' y ',
        privacyPolicy: 'Política de privacidad',
        accountText: 'ya tienes una cuenta?',
        loginText: 'Iniciar sesión',
      };
    }

    return {
      header,
      description,
      confirm: `By proceeding, I confirm that I am over 18 years old and agree to ${siteName}'s `,
      terms: 'Terms',
      and: ' and ',
      privacyPolicy: 'Privacy Policy',
      accountText: 'Already have an account?',
      loginText: 'Log in',
    };
  }, [header, description, language, specificCare]);

  const useNonDiscrimination = useMemo(
    () =>
      ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
        (query.ins as string) || ''
      ) && query.care === 'Weight loss',
    [query.ins, query.care]
  );

  return (
    <Container maxWidth="xs">
      <Grid container direction="column" gap="1rem">
        {SigUpImage && (
          <Stack margin={'-32px -16px 0 -16px'} height={155}>
            <Image
              quality={75}
              src={SigUpImage.src}
              alt="image of a girl"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              priority
            />
          </Stack>
        )}
        <Typography variant="h2">{textContent.header}</Typography>
        <Stack gap="1rem">
          {textContent.description?.map(d => (
            <Typography key={d}>{d}</Typography>
          ))}
        </Stack>
        <Typography paragraph>
          {textContent.accountText}{' '}
          <NextLink
            href={Pathnames.LOG_IN}
            passHref
            style={{ textDecoration: 'none' }}
          >
            <Link underline="none">{textContent.loginText}</Link>
          </NextLink>
        </Typography>

        <SignUpForm
          isSignUp
          nextRoute={
            ['Zealthy', 'FitRx'].includes(siteName ?? '')
              ? Pathnames.REGION_SCREEN
              : Pathnames.REGION_SCREEN_ZP
          }
          referral={referral}
          code={code!}
          siteName={siteName}
        />

        <Typography
          maxWidth="400px"
          margin="auto 0"
          marginTop={isMobile ? 0 : '2rem'}
          textAlign="center"
        >
          {textContent.confirm}
          <NextLink
            href={`https://www.${domain}/terms-of-use/`}
            passHref
            style={{ textDecoration: 'none' }}
          >
            <Link target="_blank" underline="none">
              {textContent.terms}
            </Link>
          </NextLink>
          {useNonDiscrimination && (
            <>
              ,{' '}
              <NextLink
                href={`https://www.${domain}/aca-nondiscrimination-notice`}
                passHref
                style={{ textDecoration: 'none' }}
              >
                <Link target="_blank" underline="none">
                  Nondiscrimination Policy
                </Link>
              </NextLink>
              ,{' '}
            </>
          )}
          {textContent.and}
          <NextLink
            href={`https://www.${domain}/privacy-policy/`}
            passHref
            style={{ textDecoration: 'none' }}
          >
            <Link target="_blank" underline="none">
              {textContent.privacyPolicy}
            </Link>
          </NextLink>
          .
          <Typography
            maxWidth="400px"
            margin="auto 0"
            marginTop={isMobile ? '1rem' : '1.5rem'}
            textAlign="center"
            sx={{ fontSize: '14px', color: 'black' }}
          >
            {`This site is protected by reCAPTCHA and the Google `}{' '}
            <Link
              href="https://policies.google.com/terms"
              target="_blank"
              underline="none"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="https://policies.google.com/privacy"
              target="_blank"
              underline="none"
            >
              Privacy Policy{' '}
            </Link>
            apply.
          </Typography>
        </Typography>
      </Grid>
    </Container>
  );
};

SignUpComponent.displayName = 'SignUp';

export default memo(SignUpComponent);
