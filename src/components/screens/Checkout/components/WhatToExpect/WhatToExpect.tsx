import Box from '@mui/material/Box';
import CheckMark from '@/components/shared/icons/CheckMark';
import CustomText from '@/components/shared/Text';
import { asyncVisitInfo, syncVisitInfo } from './visitInfo';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeSelect } from '@/components/hooks/useIntake';
import { useSelector } from '@/components/hooks/useSelector';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  useActivePatientSubscription,
  useCouponCodeRedeem,
} from '@/components/hooks/data';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { usePatientState } from '@/components/hooks/usePatient';
import { useAddSkincareMedication } from '@/components/hooks/useAddSkincareMedication';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useVWO } from '@/context/VWOContext';
import { useLanguage, useVWOVariationName } from '@/components/hooks/data';
import { useConsultationActions } from '@/components/hooks/useConsultation';
import { ConsultationType } from '@/context/AppContext/reducers/types/consultation';
import getConfig from '../../../../../../config';

interface CustomListItem {
  title?: string;
  body: string;
}
interface WhatToExpectItem {
  title: string;
  subTitle: string[];
}

type WhatToExpectType = Record<string, WhatToExpectItem>;

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const activeSubscriptionWhatNext = {
  title: "Next, you'll be able to confirm your visit.",
  subTitle: ['Once you confirm your payment details, here’s what to expect:'],
};

const texasPayUntilPrescribed = {
  title: `Next, you’ll be able to enter your payment details for $96 off your first month of ${siteName} Weight Loss! You’ll only pay if prescribed.`,
  subTitle: [
    `After putting your payment information in, your ${siteName} provider will review your intake and help you get your GLP-1 medication, if appropriate.`,
  ],
};

const mapCareSelectionToWhatNextTitle: WhatToExpectType = {
  [`${PotentialInsuranceOption.FIRST_MONTH_FREE} ${SpecificCareOption.WEIGHT_LOSS}`]:
    {
      title:
        'Next, you’ll be able to enter your payment details to sign up for your first month of membership free.',
      subTitle: [
        `After putting your payment information in, your ${siteName} provider will review your intake and help you get your GLP-1 medication, if appropriate.`,
      ],
    },
  [`${PotentialInsuranceOption.WEIGHT_LOSS_SYNC} ${SpecificCareOption.WEIGHT_LOSS}`]:
    {
      title: `Next, you’ll be able to sign up for ${siteName}’s Weight Loss program for just $39!`,
      subTitle: [
        `After putting your payment information in, you will hold a visit with a ${siteName} provider who can discuss paths to lasting weight loss, including taking GLP-1 medication supplemented by coaching.`,
      ],
    },
  [`${PotentialInsuranceOption.TIRZEPATIDE_BUNDLED} ${SpecificCareOption.WEIGHT_LOSS}`]:
    {
      title:
        'Next, you’ll be able to enter your payment details to get your first month of lasting weight loss, including your first month of Tirzepatide!',
      subTitle: [
        `After putting your payment information in, your ${siteName} provider will review your intake and help you get tirzepatide (if prescribed), the main active ingredient in Mounjaro® and Zepbound™.`,
        'We have a 30-day refund guarantee and you can cancel any time.',
      ],
    },
  [`${PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED} ${SpecificCareOption.WEIGHT_LOSS}`]:
    {
      title:
        'Next, you’ll be able to enter your payment details to get your first month of lasting weight loss, including your first month of Semaglutide!',
      subTitle: [
        `After putting your payment information in, your ${siteName} provider will review your intake and help you get Semaglutide (if prescribed), the main active ingredient in Wegovy and Ozempic.`,
        'We have a 30-day refund guarantee and you can cancel any time.',
      ],
    },
  [`${PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED} ${SpecificCareOption.WEIGHT_LOSS}`]:
    {
      title:
        'Next, you’ll be able to enter your payment details to get your first month of lasting weight loss, including your first month of Semaglutide!',
      subTitle: [
        `After putting your payment information in, your ${siteName} provider will review your intake and help you get Semaglutide (if prescribed), the main active ingredient in Wegovy and Ozempic.`,
        'We have a 30-day refund guarantee and you can cancel any time.',
      ],
    },
  [`${PotentialInsuranceOption.TX} ${SpecificCareOption.WEIGHT_LOSS}`]: {
    title: `Next, you’ll be able to enter your payment details for $70 off your first month of ${siteName} Weight Loss!`,
    subTitle: [
      `After putting your payment information in, your ${siteName} provider will review your intake and help you get your GLP-1 medication, if appropriate.`,
    ],
  },
  [`${PotentialInsuranceOption.OH} ${SpecificCareOption.WEIGHT_LOSS}`]: {
    title: `Next, you’ll be able to enter your payment details for $141 off your first 3 months of ${siteName} Weight Loss or $96 off your first month!`,
    subTitle: [
      `After putting your payment information in, your ${siteName} provider will review your intake and help you get your GLP-1 medication, if appropriate.`,
    ],
  },
  [`${PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA} ${SpecificCareOption.WEIGHT_LOSS}`]:
    {
      title: `Next, you’ll be able to sign up for Z-Plan by ${siteName} for just $39!`,
      subTitle: [
        `After putting your payment information in, you will hold a visit with a ${siteName} provider who can discuss paths to lasting weight loss, including taking GLP-1 medication supplemented by coaching.`,
      ],
    },
  [`${PotentialInsuranceOption.MEDICAID_ACCESS_FLORIDA} ${SpecificCareOption.WEIGHT_LOSS}`]:
    {
      title: `Next, you’ll be able to sign up for Z-Plan by ${siteName} for just $39!`,
      subTitle: [
        `After putting your payment information in, you will hold a visit with a ${siteName} provider who can discuss paths to lasting weight loss, including taking GLP-1 medication supplemented by coaching.`,
      ],
    },
  [`${PotentialInsuranceOption.MEDICARE} ${SpecificCareOption.WEIGHT_LOSS}`]: {
    title: `Next, you’ll be able to sign up for ${siteName}’s Weight Loss Access program for just $39!`,
    subTitle: [
      `After putting your payment information in, you will hold a visit with a ${siteName} provider who can discuss paths to lasting weight loss, including taking GLP-1 medication supplemented by coaching.`,
    ],
  },
  [`${PotentialInsuranceOption.BLUE_CROSS_ILLINOIS} ${SpecificCareOption.PRIMARY_CARE}`]:
    {
      title: "Next, you'll be able to confirm your visit. ",
      subTitle: [
        'Once you put in your payment details, here’s what to expect:',
      ],
    },
  [`${PotentialInsuranceOption.OUT_OF_NETWORK} ${SpecificCareOption.PRIMARY_CARE}`]:
    {
      title: "Next, you'll be able to confirm your visit. ",
      subTitle: [
        'Once you put in your payment details, here’s what to expect:',
      ],
    },
  [`${PotentialInsuranceOption.OUT_OF_NETWORK_V2} ${SpecificCareOption.PRIMARY_CARE}`]:
    {
      title: "Next, you'll be able to confirm your visit. ",
      subTitle: [
        'Once you confirm your payment details, here’s what to expect:',
      ],
    },
  [`${PotentialInsuranceOption.AETNA} ${SpecificCareOption.PRIMARY_CARE}`]: {
    title: `Next, you'll enter your payment information to confirm your ${siteName} visit.`,
    subTitle: [
      'This will be used for potential co-pays or co-insurance only. Your care is being covered by Aetna.',
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [`${PotentialInsuranceOption.AETNA} ${SpecificCareOption.ANXIETY_OR_DEPRESSION}`]:
    {
      title: `Next, you'll enter your payment information to confirm your ${siteName} visit.`,
      subTitle: [
        'This will be used for potential co-pays or co-insurance only. Your psychiatric care is being covered by Aetna.',
        "After putting your payment information in, here's what to expect:",
      ],
    },
  [SpecificCareOption.WEIGHT_LOSS]: {
    title: `Next, you’ll be able to enter your payment details to get your first month of ${siteName} Weight Loss for just $39!`,
    subTitle: [
      `After putting your payment information in, your ${siteName} provider will review your intake and help you get your GLP-1 medication, if appropriate.`,
    ],
  },
  [SpecificCareOption.ERECTILE_DYSFUNCTION]: {
    title:
      "Next, you'll enter your payment information for a free medical review and free shipping on your order.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.HAIR_LOSS]: {
    title:
      "Next, you'll enter your payment information for 50% off your first order.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.BIRTH_CONTROL]: {
    title: `Next, you’ll be able to sign up for your free ${siteName} medical provider review of your birth control request!`,
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.ANXIETY_OR_DEPRESSION]: {
    title: `Next, you'll enter your payment information to get 70% off expert psychiatry at ${siteName} for your first month.`,
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.PRIMARY_CARE]: {
    title:
      "Next, you'll enter your payment information to confirm your primary care appointment.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.VIRTUAL_URGENT_CARE]: {
    title: `Next, you'll enter your payment information to get in line for your video visit with a ${siteName} provider.`,
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.ACNE]: {
    title: "Next, you'll enter your payment information for $30 off.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.ANTI_AGING]: {
    title: "Next, you'll enter your payment information for $30 off.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.MELASMA]: {
    title: "Next, you'll enter your payment information for $30 off.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.ROSACEA]: {
    title: "Next, you'll enter your payment information for $30 off.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.SKINCARE]: {
    title:
      "Next, you'll enter your payment information for your $20 dermatology visit.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.DEFAULT]: {
    title: `Next, you'll be able to sign up for your first 3 months free at ${siteName}!`,
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.ENCLOMIPHENE]: {
    title: `Next, you’ll be able to sign up for your free ${siteName} medical provider review of your enclomiphene request!`,
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.SEX_PLUS_HAIR]: {
    title: `Next, you’ll be able to sign up for your free ${siteName} medical provider review of your sex + hair request!`,
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [`${PotentialInsuranceOption.ED_HARDIES} ${SpecificCareOption.ERECTILE_DYSFUNCTION}`]:
    {
      title:
        "Next, you'll enter your payment information for a free medical review and free shipping on your order.",
      subTitle: [
        "After putting your payment information in, here's what to expect:",
      ],
    },
  [SpecificCareOption.PREP]: {
    title: `Next, you’ll be able to sign up for your free ${siteName} medical provider review of your PrEP request!`,
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.SLEEP]: {
    title:
      "Next, you'll enter your payment information for a free medical review and free shipping on your order.",
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
  [SpecificCareOption.MENOPAUSE]: {
    title:
      'Next, you’ll be able to sign up for your medical provider review of your menopause request for only $49!',
    subTitle: [
      "After putting your payment information in, here's what to expect:",
    ],
  },
};

const WhatToExpect = () => {
  const isSync = useSelector(store => store.visit.isSync);
  const isMobile = useIsMobile();
  const {
    selectedCare: { careSelections },
    medications,
  } = useVisitState();
  const { addMedication } = useVisitActions();
  const vwoContext = useVWO();
  const [loading, setLoading] = useState(false);
  const { data: activeSubscriptions = [] } = useActivePatientSubscription();
  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const { potentialInsurance, specificCare, variant } = useIntakeSelect(
    intake => intake
  );
  const patientState = usePatientState();
  const { id, questionnaires } = useVisitState();
  const { addConsultation } = useConsultationActions();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patientState.id
  );
  const careOption = useAddSkincareMedication(specificCare, questionnaires);
  const language = useLanguage();

  const variant6471 =
    variant === '6471' &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === null;

  let variationName5481: string | null | undefined;

  if (
    ['CA', 'TX'].includes(patientState?.region!) &&
    [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED]?.includes(
      potentialInsurance || PotentialInsuranceOption.DEFAULT
    )
  ) {
    variationName5481 = vwoContext?.getVariationName(
      '5481',
      String(patientState?.id)
    );
  }

  useEffect(() => {
    if (variationName5481 === 'Variation-1' && !medications.length) {
      addMedication({
        medication_quantity_id: 98,
        name: 'Semaglutide',
        price: 891,
        quantity: 1,
        recurring: { interval: 'month', interval_count: 3 },
        type: MedicationType.WEIGHT_LOSS,
        discounted_price: 630,
        dosage: '10 mg (3 vials included in shipment - 2.5 mg, 2.5 mg, 5 mg)',
        dose: '<p class="subtitle">Month 1 (Weeks 1-4)</p>\n    <p>Inject 10 units (0.25 mg) weekly</p><p class="subtitle">Month 2 (Weeks 5-8)</p>\n    <p>Inject 20 units (0.5 mg) weekly</p><p class="subtitle">Month 3 (Weeks 9-12)</p>\n    <p>Inject 50 units (1.25 mg) weekly</p>',
        note: `Weight loss - Semaglutide BUNDLED - 3 months.  Dosage: 10 mg (3 vials included in shipment - 2.5 mg, 2.5 mg, 5 mg)`,
      });
    }
  }, [medications, variationName5481]);

  useEffect(() => {
    if (specificCare === 'Prep') {
      addConsultation({
        name: `PrEP Medical Consultation`,
        price: 105,
        type: ConsultationType.PREP,
      });
    }
  }, [specificCare]);

  useEffect(() => {
    if (specificCare === 'Menopause') {
      addConsultation({
        name: `Menopause Medical Consultation`,
        price: 49,
        type: ConsultationType.MENOPAUSE,
      });
    }
  }, [specificCare]);

  const calculatedSpecificCare = useCalculateSpecificCare();

  const getVisitKey = (isSync: boolean) => {
    if (isSync) {
      return (
        (potentialInsurance === PotentialInsuranceOption.WEIGHT_LOSS_SYNC &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          `${PotentialInsuranceOption.WEIGHT_LOSS_SYNC} ${SpecificCareOption.WEIGHT_LOSS}`) ||
        (potentialInsurance === PotentialInsuranceOption.OH &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          `${PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA} ${SpecificCareOption.WEIGHT_LOSS}`) ||
        (['Medicare Access Florida', 'Medicaid Access Florida'].includes(
          potentialInsurance || ''
        ) &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          `${PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA} ${SpecificCareOption.WEIGHT_LOSS}`) ||
        (potentialInsurance === PotentialInsuranceOption.MEDICARE &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          `${PotentialInsuranceOption.MEDICARE} ${SpecificCareOption.WEIGHT_LOSS}`) ||
        (potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS &&
          specificCare === SpecificCareOption.PRIMARY_CARE &&
          `${PotentialInsuranceOption.OUT_OF_NETWORK} ${SpecificCareOption.PRIMARY_CARE}`) ||
        (potentialInsurance === PotentialInsuranceOption.OUT_OF_NETWORK &&
          specificCare === SpecificCareOption.PRIMARY_CARE &&
          `${PotentialInsuranceOption.OUT_OF_NETWORK} ${SpecificCareOption.PRIMARY_CARE}`) ||
        (potentialInsurance === PotentialInsuranceOption.OUT_OF_NETWORK_V2 &&
          specificCare === SpecificCareOption.PRIMARY_CARE &&
          `${PotentialInsuranceOption.OUT_OF_NETWORK} ${SpecificCareOption.PRIMARY_CARE}`) ||
        (potentialInsurance === PotentialInsuranceOption.AETNA &&
          specificCare === SpecificCareOption.PRIMARY_CARE &&
          `${PotentialInsuranceOption.AETNA} ${SpecificCareOption.PRIMARY_CARE}`) ||
        (potentialInsurance === PotentialInsuranceOption.AETNA &&
          specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION &&
          `${PotentialInsuranceOption.AETNA} ${SpecificCareOption.ANXIETY_OR_DEPRESSION}`) ||
        (specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION &&
          SpecificCareOption.ANXIETY_OR_DEPRESSION) ||
        (specificCare === SpecificCareOption.PRIMARY_CARE &&
          SpecificCareOption.PRIMARY_CARE) ||
        (specificCare === SpecificCareOption.VIRTUAL_URGENT_CARE &&
          SpecificCareOption.VIRTUAL_URGENT_CARE) ||
        (specificCare === SpecificCareOption.ENCLOMIPHENE &&
          SpecificCareOption.ENCLOMIPHENE) ||
        calculatedSpecificCare
      );
    } else {
      return specificCare ?? calculatedSpecificCare;
    }
  };

  const visitKey = getVisitKey(isSync);

  const listItems: CustomListItem[] =
    (isSync
      ? syncVisitInfo[visitKey as keyof typeof syncVisitInfo]
      : asyncVisitInfo[visitKey as keyof typeof asyncVisitInfo]) || [];

  const { title, subTitle } = useMemo(() => {
    const specificCareCalculated = specificCare ?? calculatedSpecificCare;
    const key =
      potentialInsurance != null &&
      potentialInsurance !== PotentialInsuranceOption.DEFAULT &&
      specificCareCalculated != null
        ? `${potentialInsurance} ${specificCareCalculated}`
        : specificCareCalculated || SpecificCareOption.DEFAULT;

    if (key === SpecificCareOption.DEFAULT && activeSubscriptions.length) {
      return activeSubscriptionWhatNext;
    }

    if (variant6471) {
      return texasPayUntilPrescribed;
    }

    if (!(key in mapCareSelectionToWhatNextTitle)) {
      return mapCareSelectionToWhatNextTitle[SpecificCareOption.DEFAULT];
    } else {
      return mapCareSelectionToWhatNextTitle[key];
    }
  }, [
    activeSubscriptions.length,
    calculatedSpecificCare,
    potentialInsurance,
    specificCare,
  ]);

  useEffect(() => {
    if (specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT)
      Router.push(Pathnames.CHECKOUT);
  }, [specificCare]);

  const handleContinue = useCallback(async () => {
    if (specificCare === SpecificCareOption.SKINCARE && !id) {
      setLoading(true);
      await createVisitAndNavigateAway(
        [careOption || SpecificCareOption.SKINCARE],
        {
          navigateAway: false,
          resetValues: false,
          resetMedication: false,
        }
      );
      setLoading(false);
    }

    if (potentialInsurance !== 'OH') {
      Router.push(Pathnames.CHECKOUT);
    } else {
      Router.push(Pathnames.WEIGHT_LOSS_DEAL);
    }
  }, [createVisitAndNavigateAway, potentialInsurance, specificCare]);

  let finalTitle = title;
  let finalSubtitle = subTitle;
  let continueText = 'Continue';

  if (language === 'esp') {
    continueText = 'Continuar';
    finalTitle = `Podrás ingresar los detalles de tu pago para obtener $96 de descuento en tu primer mes de pérdida de peso con ${siteName} en seguida.`;
    finalSubtitle = [
      `Después de ingresar su información de pago, su proveedor de ${siteName} revisará su ingreso y le ayudará a obtener su medicación GLP-1, si es apropiado.`,
    ];
  }

  return (
    <CenteredContainer maxWidth="xs" gap="16px">
      <Typography variant="h2">{finalTitle}</Typography>
      <Stack gap="48px">
        <Grid container direction="column" gap="1rem">
          {finalSubtitle.map(sub => (
            <Typography key={sub} sx={{ fontWeight: '500' }}>
              {sub}
            </Typography>
          ))}
          {listItems?.length ? (
            <List
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {listItems.map((item, index) => (
                <ListItem
                  key={'item' + index}
                  sx={{
                    padding: '0',
                    gap: '16px',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box marginTop={isMobile ? '5px' : '3px'}>
                    <CheckMark />
                  </Box>
                  <Box display="flex" flexDirection="column" gap="8px">
                    {item?.title && (
                      <CustomText fontWeight="600">{item?.title}</CustomText>
                    )}
                    <CustomText>{item.body}</CustomText>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : null}
          {couponCodeRedeem?.code === 'katie' &&
          specificCare === SpecificCareOption.WEIGHT_LOSS ? (
            <CustomText>
              {
                'You’ll also get a bonus $10 radio discount for a total of $96 off the first month.'
              }
            </CustomText>
          ) : null}
        </Grid>
        <LoadingButton loading={loading} onClick={handleContinue}>
          {continueText}
        </LoadingButton>
      </Stack>
    </CenteredContainer>
  );
};

export default WhatToExpect;
