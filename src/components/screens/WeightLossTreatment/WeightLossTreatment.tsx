import {
  useCompoundMatrix,
  useLanguage,
  usePatient,
  usePatientOrders,
  usePatientPrescriptions,
  useVWOVariationName,
  useWeightLossSubscription,
} from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import { useNextDosage } from '@/components/hooks/useTitrationSelection';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  MedicationAddOn,
  WeightLossBulkAddOn,
} from '@/components/shared/AddOnPayment';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import CompoundDisclaimer from '@/components/shared/CompoundDisclaimer';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Spinner from '@/components/shared/Loading/Spinner';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useVWO } from '@/context/VWOContext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Radio } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DOMPurify from 'dompurify';
import { useSearchParams } from 'next/navigation';
import Router from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { compoundMedications, details } from './data';

import getConfig from '../../../../config';

const RedirectToHome = () => {
  useEffect(() => {
    Router.push({
      pathname: `/patient-portal`,
    });
  }, []);

  return (
    <Stack alignItems="center">
      <Spinner />
    </Stack>
  );
};

type MedProps = {
  brand: string;
  drug: string;
  body1: string;
  body2: string;
};
type MedObjectProps = {
  name: string;
  type: MedicationType;
  price?: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  dose?: string | null;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
  currMonth: number | null | undefined;
  matrixId: number;
};

type CompoundDetailProps = {
  [key: string]: {
    saving: number;
    title: string;
    singleTitle: string;
    singleDescription: string;
    name: string;
    body1: string;
    body2: string;
    medData: MedObjectProps;
    medBulkData: MedObjectProps;
  };
};

const WeightLossTreatment = () => {
  const vwoClient = useVWO();
  const { id } = Router.query;
  const { data: patient } = usePatient();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const { addMedication } = useVisitActions();
  const [checked, setChecked] = useState<string>(
    searchParams?.get('checked') || ''
  );
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const [skipTitration, setSkipTitration] = useState<boolean>(false);
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { data: compoundMatrix } = useCompoundMatrix();
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const { data: weightLossSubscription } = useWeightLossSubscription();
  const { specificCare, potentialInsurance } = useIntakeState();
  const { data: patientOrders } = usePatientOrders();
  const { data: variation75801 } = useVWOVariationName('75801');
  const { data: variation4798 } = useVWOVariationName('4798');
  const [showVideo, setShowVideo] = useState(false);
  const { data: variation7746_2 } = useVWOVariationName('7746-2');
  const language = useLanguage();

  const isVariation7746_2 = variation7746_2?.variation_name === 'Variation-1';

  const videoUrl =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'https://api.getzealthy.com/storage/v1/object/public/videos/Dr.M%20Final.mp4?t=2024-09-16T22%3A33%3A45.765Z'
      : 'https://staging.api.getzealthy.com/storage/v1/object/public/videos/Dr.M%20Final.mp4?t=2024-09-16T22%3A12%3A23.609Z';

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  useEffect(() => {
    if (checked.length) setShowVideo(true);
  }, [checked]);

  let videoText = `Want to learn more about semaglutide and tirzepatide at ${siteName} from our Medical Director? Watch this video.`;

  const hasWeightLossMed = patientOrders?.some(
    order =>
      order?.prescription?.medication?.toLowerCase().includes('semaglutide') ||
      order?.prescription?.medication?.toLowerCase().includes('tirzepatide')
  );

  const next3MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_multi_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions
  );
  const next1MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_monthly',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions
  );

  const [learnMore, setLearnMore] = useState(false);
  const [learnSingleMore, setLearnSingleMore] = useState(false);
  const [variationName3780, setVariationName3780] = useState<any>(null);
  const [variationName3594, setVariationName3594] = useState<any>(null);
  const [campaignKey, setCampaignKey] = useState('');
  const { variant } = useIntakeState();
  const { data: vwoVariationName } = useVWOVariationName(campaignKey);
  const [loadingPage, setLoadingPage] = useState(true);
  const pathname = Router.pathname;

  const isPostCheckout = pathname?.includes('post-checkout');
  const isCompoundRefill = pathname?.includes('weight-loss-compound-refill');
  const isPostCheckoutOrCompoundRefill = isPostCheckout || isCompoundRefill;

  const { upsertActionItem } = useMutatePatientActionItems();

  let variationName: any = null;
  let variation3594: any = null;

  const activateVWOvariant = async () => {
    if (vwoClient && patient?.id && ['FL'].includes(patient?.region || '')) {
      variationName = await vwoClient?.activate('3463', patient);
    }
    if (
      vwoClient &&
      patient?.id &&
      ['IN', 'MN'].includes(patient?.region || '')
    ) {
      variation3594 = await vwoClient?.activate('3594', patient);
      setVariationName3594(variation3594);
    }
  };

  useEffect(() => {
    activateVWOvariant();
  }, [vwoClient, patient, specificCare, patientPrescriptions]);

  useEffect(() => {
    if (patient?.id && !['IN', 'MN']?.includes(patient?.region || '')) {
      setCampaignKey('3780');
    }
  }, [patient?.id, patient?.region, vwoClient]);

  useEffect(() => {
    if (vwoVariationName && campaignKey === '3780') {
      setVariationName3780(vwoVariationName?.variation_name || '');
    }
  }, [vwoVariationName, campaignKey]);

  const isBundlePatient = useMemo(() => {
    return [449, 297, 249].includes(weightLossSubscription?.price || 0);
  }, [weightLossSubscription?.price]);

  const handleChange = (value: string) => {
    setChecked(value);
  };

  async function handleConfirmMed() {
    setLoading(true);
    Router.push({
      pathname: `/patient-portal/weight-loss-treatment/${id}`,
      query:
        id === 'compound'
          ? { med: medicationSelected, quantity: true }
          : { med: medicationSelected, review: true },
    });
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }

  async function handleConfirmQuantity() {
    if (!checked.length) {
      return setDisplayError(true);
    }
    setDisplayError(false);

    if (!!medicationSelected && compoundDetails) {
      addMedication(
        checked === 'bulk'
          ? compoundDetails[medicationSelected].medBulkData
          : compoundDetails[medicationSelected].medData
      );
    }

    setLoading(true);
    Router.push({
      pathname: `/patient-portal/weight-loss-treatment/${id}`,
      query: { med: medicationSelected, review: true, checked },
    });
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }

  async function selectMedication(med: MedProps) {
    // Map Spanish medication names to English ones for URL
    let urlMedName = med.brand;
    if (language === 'es' || language === 'esp') {
      const spanishToEnglish: Record<string, string> = {
        Semaglutida: 'Semaglutide',
        Tirzepatida: 'Tirzepatide',
        'Semaglutida Oral': 'Oral Semaglutide',
        Metformina: 'Metformin',
        'Bupropión y Naltrexona': 'Bupropion and Naltrexone',
        Liraglutida: 'Liraglutide',
      };
      urlMedName = spanishToEnglish[med.brand] || med.brand;
    }

    Router.push({
      pathname: `/patient-portal/weight-loss-treatment/${id}`,
      query: {
        med: med.brand,
      },
    });

    window.scrollTo({ top: 0, left: 0 });
  }

  const listItems = [
    {
      title: 'Prior authorization: ',
      body: 'Our insurance coordination team will submit your paperwork for your insurance to cover Wegovy.',
    },
    {
      title: 'Check your email and SMS: ',
      body: `We’ll send you a message to let you know if your prior authorization was accepted and, if medically appropriate, your ${siteName} provider will fill your prescription.`,
    },
    {
      body: 'While you wait, you may chat with your coach or coordinator in our messaging portal if you have any questions.',
    },
  ];

  const updateAction = useCallback(
    async (patientId: number) => {
      const twoHoursLater = new Date();
      twoHoursLater.setHours(new Date().getHours() + 2);
      upsertActionItem({
        patient_id: patientId,
        type: 'COMPOUND_MEDICATION_REQUEST',
        title: 'Complete your request for compound Semaglutide or Tirzepatide',
        body: 'Skip the insurance process and get semaglutide or tirzepatide shipped to you for as little as $151/month.',
        path: Router.asPath,
        created_at: twoHoursLater.toISOString(),
      });
    },
    [patient?.region, upsertActionItem]
  );

  useEffect(() => {
    if (!patient) return;
    if (!weightLossSubscription) return;
    if (isBundlePatient) return;

    updateAction(patient.id);
  }, [isBundlePatient, patient, updateAction, weightLossSubscription]);

  async function fetchCompoundDetails() {
    const object: CompoundDetailProps = {
      [`${medicationSelected}`]: {
        saving: Math.round(
          (135 - 108) * 2 +
            (next1MonthDosage?.price! * 3 - next3MonthDosage?.price!)
        ),
        name: medicationSelected || '',
        title:
          ['IN', 'MN'].includes(patient?.region || '') &&
          variationName3594 !== 'Variation-1'
            ? 'Buy 3 month supply of medication & get 20% off for a limited time'
            : '20% off on a 3 month supply of medication',
        singleTitle:
          ['IN', 'MN'].includes(patient?.region || '') &&
          variationName3594 !== 'Variation-1'
            ? 'Buy 1 month supply of medication'
            : '1 month supply of medication',
        singleDescription: `$${next1MonthDosage?.price} for your next month of ${medicationSelected}`,
        body1:
          'You’ll get 20% off the next 3 months of your weight loss membership. This means your next 3 months of membership will be just $108/month.',
        body2: `In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your ${siteName} provider will need to be able to monitor your care over the next 3 months at least.`,
        medData: {
          name: `${medicationSelected} weekly injections`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price: next1MonthDosage?.price,
          dosage: `${next1MonthDosage?.med?.vial_size?.trim()}${
            next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
            next1MonthDosage?.med?.pharmacy === 'Empower'
              ? ` (3 vials included - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                next1MonthDosage?.med?.pharmacy !== 'Red Rock'
              ? ` (3 vials included in shipment - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                next1MonthDosage?.med?.pharmacy === 'Red Rock'
              ? ` (3 shipments - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next1MonthDosage?.med?.number_of_vials === 2
              ? ` (2 vials included in shipment - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next1MonthDosage?.med?.number_of_vials === 1 &&
                next1MonthDosage?.med?.duration_in_days === 90
              ? ``
              : ''
          }`,
          dose: next1MonthDosage?.med?.dose,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          medication_quantity_id: 98,
          currMonth: next1MonthDosage?.med?.current_month,
          matrixId: next1MonthDosage?.med?.id!,
        },
        medBulkData: {
          name: `${medicationSelected} weekly injections`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price: next3MonthDosage?.price,
          discounted_price: next3MonthDosage?.price! / 3,
          dosage: `${next3MonthDosage?.med?.vial_size?.trim()}${
            next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
            next3MonthDosage?.med?.pharmacy === 'Empower'
              ? ` (3 vials included - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                next3MonthDosage?.med?.pharmacy !== 'Red Rock'
              ? ` (3 vials included in shipment - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                next3MonthDosage?.med?.pharmacy === 'Red Rock'
              ? ` (3 shipments - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next3MonthDosage?.med?.number_of_vials === 2
              ? ` (2 vials included in shipment - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next3MonthDosage?.med?.number_of_vials === 1 &&
                next3MonthDosage?.med?.duration_in_days === 90
              ? ``
              : ''
          }`,
          dose: next3MonthDosage?.med?.dose,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 98,
          currMonth: next3MonthDosage?.med?.current_month,
          matrixId: next3MonthDosage?.med?.id!,
        },
      },
    };
    setCompoundDetails(object);
  }

  useEffect(() => {
    if (next1MonthDosage?.med && next3MonthDosage?.med) {
      fetchCompoundDetails();
    }
  }, [next1MonthDosage?.med, next3MonthDosage?.med, skipTitration]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingPage(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  function updateCostString(str: string, newCost: number): string {
    if (!str) return str;
    return str.replace(/\$\d+/g, `$${newCost}`);
  }

  const semaglutideCompoundDetails = compoundDetails?.['Semaglutide'];
  const semaglutideDetails = details?.['Semaglutide'];
  const semaglutideOption = compoundMedications.find(
    (m: any) => m.brand === 'Semaglutide'
  );

  const tirzepatideCompoundDetails = compoundDetails?.['Tirzepatide'];
  const tirzepatideDetails = details?.['Tirzepatide'];
  const tirzepatideOption = compoundMedications.find(
    (m: any) => m.brand === 'Tirzepatide'
  );

  function updateDetails(
    option: any,
    details: any,
    compoundDetails: any,
    cost: number,
    bulkCost: number,
    medicationName: string
  ) {
    if (option) option.body3 = updateCostString(option.body3, cost);

    if (compoundDetails) {
      compoundDetails.singleDescription = `$${cost} for your next month of ${medicationName}`;
      compoundDetails.medData.price = cost;
      compoundDetails.medBulkData.price = bulkCost;
      compoundDetails.medBulkData.discounted_price = bulkCost / 3;
      compoundDetails.saving = cost * 3 - bulkCost + 54;
    }

    if (details) {
      details.cost = [
        `As a ${siteName} member, the cost of the medication is as little as $${cost}/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home, which is included in the price.`,
      ];
      ['costCA', 'costCT', 'costCTV2'].forEach(key => {
        if (details[key])
          details[key] = details[key].map((str: string) =>
            updateCostString(str, cost)
          );
      });
    }
  }

  type VariationConfig = {
    semaglutide: { cost: number; bulkCost: number };
    tirzepatide: { cost: number; bulkCost: number };
  };

  const variationMap: Record<'Variation-1' | 'Variation-2', VariationConfig> = {
    'Variation-1': {
      semaglutide: { cost: 249, bulkCost: 599 },
      tirzepatide: { cost: 419, bulkCost: 1059 },
    },
    'Variation-2': {
      semaglutide: { cost: 199, bulkCost: 454 },
      tirzepatide: { cost: 329, bulkCost: 670 },
    },
  };

  const variation =
    variationMap[
      variation4798?.variation_name as 'Variation-1' | 'Variation-2'
    ];

  if (variation) {
    const { semaglutide, tirzepatide } = variation;

    updateDetails(
      semaglutideOption,
      semaglutideDetails,
      semaglutideCompoundDetails,
      semaglutide.cost,
      semaglutide.bulkCost,
      'Semaglutide'
    );
    updateDetails(
      tirzepatideOption,
      tirzepatideDetails,
      tirzepatideCompoundDetails,
      tirzepatide.cost,
      tirzepatide.bulkCost,
      'Tirzepatide'
    );
  }

  const weightLossPercentageTextBulk = useMemo(() => {
    if (medicationSelected?.toLowerCase().includes('semaglutide')) {
      return isPostCheckoutOrCompoundRefill || isVariation7746_2
        ? `On average, people lose 6.9% of their body weight in their first 3 months with semaglutide**`
        : `On average, people lose 7% of their body weight in their first 3 months with semaglutide**”`;
    }
    if (medicationSelected?.toLowerCase().includes('tirzepatide')) {
      return isPostCheckoutOrCompoundRefill || isVariation7746_2
        ? `On average, people lose 8% of their body weight in their first 3 months with tirzepatide**`
        : `On average, people lose 8% of their body weight in their first 3 months with tirzepatide**`;
    }
  }, [isVariation7746_2, medicationSelected, isPostCheckoutOrCompoundRefill]);

  if (loadingPage) {
    return <Spinner />;
  }

  return (
    <Box>
      {review &&
        (id === 'compound' ? (
          checked === 'single' ? (
            <MedicationAddOn videoUrl={videoUrl} />
          ) : checked === 'bulk' ? (
            <WeightLossBulkAddOn currentMonth={currMonth} videoUrl={videoUrl} />
          ) : (
            <Box>
              <Spinner />
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
              {'Your responses are being reviewed!'}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
              {`Your ${siteName} Provider may reach out to you if they have any additional questions. Here’s what’s next:`}
            </Typography>
            <List
              sx={{
                listStyleType: 'disc',
                pl: 3,
                marginBottom: '3rem',
              }}
              disablePadding
            >
              {listItems.map((item, index) => (
                <ListItem key={index} sx={{ display: 'list-item', padding: 0 }}>
                  {item.title && <b>{item.title}</b>}
                  {item.body}
                </ListItem>
              ))}
            </List>
            <Button
              type="button"
              fullWidth
              onClick={() => Router.push('/patient-portal')}
            >
              Continue
            </Button>
          </Box>
        ))}

      {medicationSelected &&
      (!next3MonthDosage || !next1MonthDosage || !compoundDetails) ? (
        <Spinner />
      ) : (
        <>
          {medicationSelected && !review && quantity && compoundDetails && (
            <Box>
              <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
                {'Tell us how much medication you’d like to receive.'}
              </Typography>

              <Stack spacing={2} mb={3}>
                <Typography variant="subtitle1">
                  For a limited time, {siteName} is offering a 20% discount on
                  your medication and the next 3 months of your membership if
                  you get a 3 month supply.
                </Typography>
                {variationName && variationName === 'Variation-1' && (
                  <Link
                    onClick={() => setSkipTitration(!skipTitration)}
                    style={{
                      textDecoration: 'underline',
                      color: '#373B3D',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {skipTitration
                      ? 'Changed your mind and want to increase your dosage? See options for higher doses, which most members choose.'
                      : "Don't want to increase your dosage? Save $ by staying at your current dosage."}
                  </Link>
                )}
              </Stack>

              {variation75801?.variation_name === 'Variation-1' &&
              (checked === 'single' || checked === 'bulk') ? (
                <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
                  {videoText}
                </Typography>
              ) : null}
              {showVideo &&
                variation75801?.variation_name === 'Variation-1' && (
                  <Box sx={{ marginY: '1rem' }}>
                    <video
                      width="100%"
                      controls
                      style={{ borderRadius: '10px' }}
                      poster={
                        'https://api.getzealthy.com/storage/v1/object/public/images/announcements/thumbnailnew.png'
                      }
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                )}

              <Box
                sx={{
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  background: '#ffffff',
                  boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '1rem',
                  gap: '1.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => handleChange('bulk')}
              >
                {compoundDetails[medicationSelected].saving > 0 && (
                  <Box
                    sx={{
                      borderRadius: '0.75rem',
                      background: '#F7F9A5',
                      display: 'flex',
                      width: '17rem',
                      height: '3.25rem',
                      padding: '1rem 1.25rem',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      alignSelf: 'center',
                      fontWeight: 600,
                    }}
                  >{`For a limited time save $${compoundDetails[medicationSelected].saving}`}</Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <Radio
                    value={checked}
                    checked={checked === 'bulk'}
                    inputProps={{
                      'aria-label': 'controlled',
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="h3" fontWeight="600" mb="0.3rem">
                        {compoundDetails[medicationSelected].title}
                      </Typography>

                      <Typography
                        variant="body1"
                        mb={
                          ['IN', 'MN'].includes(patient?.region || '')
                            ? '1rem'
                            : '0.3rem'
                        }
                      >
                        {`${
                          compoundDetails[medicationSelected].name
                        } ${compoundDetails[
                          medicationSelected
                        ].medBulkData.dosage.replace('mgs', 'mg')}`}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      mb="1rem"
                      fontSize="1rem !important"
                    >
                      {compoundDetails[medicationSelected].medData.price! >
                        compoundDetails[medicationSelected].medBulkData
                          .discounted_price! && (
                        <Typography
                          component="span"
                          variant="body1"
                          fontSize="1rem !important"
                          sx={{
                            textDecoration: 'line-through',
                            marginRight: '0.2rem',
                            width: '20px',
                          }}
                        >
                          {`$${Math.floor(
                            compoundDetails[medicationSelected].medData.price ??
                              0
                          )}/month`}
                        </Typography>
                      )}
                      {`$${Math.floor(
                        compoundDetails[medicationSelected].medBulkData
                          .discounted_price || 0
                      )}/month for ${
                        compoundDetails[medicationSelected].name
                      } (3 month supply)`}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      textAlign="center"
                      sx={{
                        marginBottom: '1rem',
                        fontStyle: 'italic',
                        textAlign: 'left',
                      }}
                    >
                      {' '}
                      {weightLossPercentageTextBulk}
                    </Typography>

                    {currMonth && medicationSelected ? (
                      <CompoundDisclaimer
                        currentMonth={currMonth}
                        medication={medicationSelected}
                        styles={{
                          marginBottom: '1rem',
                          fontStyle: 'italic',
                          textAlign: 'left',
                        }}
                      />
                    ) : null}

                    {['IN', 'MN'].includes(patient?.region || '') &&
                    variationName3594 !== 'Variation-1' ? (
                      <>
                        <Typography
                          variant="body1"
                          mb="1rem"
                          fontSize="0.75rem !important"
                        >
                          {compoundDetails[medicationSelected].body1}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontSize="0.75rem !important"
                        >
                          {compoundDetails[medicationSelected].body2}
                        </Typography>{' '}
                      </>
                    ) : (
                      <>
                        {learnMore ? (
                          <>
                            <Typography
                              variant="body1"
                              mb="1rem"
                              fontSize="0.75rem !important"
                            >
                              {compoundDetails?.[medicationSelected]?.body1}
                            </Typography>
                            <Typography
                              variant="body1"
                              fontSize="0.75rem !important"
                              mb="1rem"
                            >
                              {compoundDetails?.[medicationSelected]?.body2}
                            </Typography>
                            <Typography
                              variant="body1"
                              fontSize="0.75rem !important"
                            >
                              {"What's included:"}
                            </Typography>
                            <List
                              sx={{
                                listStyleType: 'disc',
                                pl: 3,
                                marginBottom: '8px',
                              }}
                            >
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {
                                  compoundDetails[medicationSelected]
                                    .medBulkData.dosage
                                }
                              </ListItem>
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {'Injection needles'}
                              </ListItem>
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {'Alcohol pads'}
                              </ListItem>
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {`Injection instructions pamphlet (video will be in your ${siteName} home page)`}
                              </ListItem>
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {
                                  'Consistent support from your care team to ensure you’re achieving your weight loss goals'
                                }
                              </ListItem>
                            </List>
                            <Typography
                              variant="body1"
                              fontSize="0.75rem !important"
                              mb="1rem"
                            >
                              Injection instructions and video will be in your
                              {siteName} home page once prescribed:
                            </Typography>
                            <Typography
                              component="div"
                              variant="body1"
                              fontSize="0.75rem !important"
                              mb="1rem"
                              sx={{
                                '.subtitle': {
                                  color: '#989898',
                                  fontFamily: 'Inter',
                                  fontSize: '0.625rem',
                                  fontStyle: 'normal',
                                  fontWeight: '700',
                                  lineHeight: '1.25rem',
                                  letterSpacing: '-0.00375rem',
                                  marginBottom: '3px',
                                },
                                '>p': {
                                  marginTop: 0,
                                  marginBottom: '3px',
                                },
                              }}
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  String(next3MonthDosage?.med?.dose)
                                ),
                              }}
                            />
                            <Typography
                              fontSize="0.75rem !important"
                              fontStyle="italic"
                              mb="1rem"
                            >
                              {medicationSelected
                                .toLowerCase()
                                ?.includes('semaglutide')
                                ? `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
                                : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
                            </Typography>
                          </>
                        ) : null}
                        <Button
                          color="grey"
                          fullWidth
                          onClick={() => setLearnMore(more => !more)}
                        >
                          {learnMore ? 'View less' : 'Learn more'}
                          {learnMore ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  background: '#ffffff',
                  boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '3rem',
                  gap: '1.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => handleChange('single')}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    height: '100%',
                  }}
                >
                  <Radio
                    sx={{ height: 'min-content' }}
                    value={checked}
                    checked={checked === 'single'}
                  />
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="h3" fontWeight="600" mb="0.3rem">
                        {compoundDetails[medicationSelected].singleTitle}
                      </Typography>
                      <Typography
                        variant="body1"
                        mb={
                          ['IN', 'MN'].includes(patient?.region || '')
                            ? '1rem'
                            : '0.2em'
                        }
                      >
                        {`${
                          compoundDetails[medicationSelected].name
                        } ${compoundDetails[
                          medicationSelected
                        ].medData.dosage.replace('mgs', 'mg')}`}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      mb="1rem"
                      fontSize="1rem !important"
                    >
                      {compoundDetails[medicationSelected].singleDescription}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      textAlign="center"
                      sx={{
                        marginBottom: '1rem',
                        fontStyle: 'italic',
                        textAlign: 'left',
                      }}
                    >
                      {medicationSelected.toLowerCase().includes('semaglutide')
                        ? isPostCheckoutOrCompoundRefill || isVariation7746_2
                          ? `On average, people lose 2.3% of their weight after 1 month on Semaglutide**`
                          : `On average, people lose 2% of their weight after 1 month on Semaglutide**`
                        : isPostCheckoutOrCompoundRefill || isVariation7746_2
                        ? `On average, people lose 2.7% of their weight after 1 month on Tirzepatide**`
                        : `On average, people lose 3% of their weight after 1 month on Tirzepatide**`}
                    </Typography>
                    {!['IN', 'MN'].includes(patient?.region || '') ||
                    variationName3594 === 'Variation-1' ? (
                      <>
                        {learnSingleMore ? (
                          <>
                            <Typography
                              variant="body1"
                              fontSize="0.75rem !important"
                            >
                              {"What's included:"}
                            </Typography>
                            <List
                              sx={{
                                listStyleType: 'disc',
                                pl: 3,
                                marginBottom: '8px',
                              }}
                            >
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {`${
                                  compoundDetails?.[medicationSelected]?.name
                                } ${compoundDetails?.[
                                  medicationSelected
                                ]?.medData.dosage?.replace('mgs', 'mg')}`}
                              </ListItem>
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {'Injection needles'}
                              </ListItem>
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {'Alcohol pads'}
                              </ListItem>
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {`Injection instructions pamphlet (video will be in your ${siteName} home page)`}
                              </ListItem>
                              <ListItem
                                sx={{
                                  fontSize: '0.75rem !important',
                                  display: 'list-item',
                                  padding: 0,
                                }}
                              >
                                {
                                  'Consistent support from your care team to ensure you’re achieving your weight loss goals'
                                }
                              </ListItem>
                            </List>
                            <Typography
                              variant="body1"
                              fontSize="0.75rem !important"
                              mb="1rem"
                            >
                              Injection instructions and video will be in your
                              {siteName} home page once prescribed:
                            </Typography>
                            <Typography
                              component="div"
                              variant="body1"
                              fontSize="0.75rem !important"
                              mb="1rem"
                              sx={{
                                '.subtitle': {
                                  color: '#989898',
                                  fontFamily: 'Inter',
                                  fontSize: '0.625rem',
                                  fontStyle: 'normal',
                                  fontWeight: '700',
                                  lineHeight: '1.25rem',
                                  letterSpacing: '-0.00375rem',
                                  marginBottom: '3px',
                                },
                                '>p': {
                                  marginTop: 0,
                                  marginBottom: '3px',
                                },
                              }}
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  String(next1MonthDosage?.med?.dose)
                                ),
                              }}
                            />
                            <Typography
                              fontSize="0.75rem !important"
                              fontStyle="italic"
                              mb="1rem"
                            >
                              {medicationSelected
                                .toLowerCase()
                                ?.includes('semaglutide')
                                ? `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
                                : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity."`}
                            </Typography>
                          </>
                        ) : null}
                        <Button
                          color="grey"
                          fullWidth
                          onClick={() => setLearnSingleMore(more => !more)}
                        >
                          {learnSingleMore ? 'View less' : 'Learn more'}
                          {learnSingleMore ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </Button>
                      </>
                    ) : null}
                  </Box>
                </Box>
              </Box>
              <Button
                fullWidth
                sx={{ marginBottom: '1rem' }}
                onClick={handleConfirmQuantity}
              >
                Continue
              </Button>
              {displayError && (
                <ErrorMessage>
                  Please select one of the options above to continue.
                </ErrorMessage>
              )}
            </Box>
          )}
          {medicationSelected && !review && !quantity && (
            <>
              <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
                {details[medicationSelected].title}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '3rem',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    marginBottom: '0.5rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1rem !important',
                      flexBasis: '25%',
                    }}
                  >
                    {'Overview'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#777777',
                      flexBasis: '75%',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {details[medicationSelected].overview}
                  </Typography>
                </Box>
                <Divider sx={{ marginBottom: '0.5rem' }} />
                <Box
                  sx={{
                    display: 'flex',
                    marginBottom: '0.5rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1rem !important',
                      flexBasis: '25%',
                    }}
                  >
                    {'Results'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#777777',
                      flexBasis: '75%',
                    }}
                  >
                    {details[medicationSelected].results}
                  </Typography>
                </Box>
                <Divider sx={{ marginBottom: '0.5rem' }} />
                <Box
                  sx={{
                    display: 'flex',
                    marginBottom: '0.5rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1rem !important',
                      flexBasis: '25%',
                    }}
                  >
                    {'Cost'}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '75%',
                    }}
                  >
                    {details[medicationSelected].cost.map((text, idx) => (
                      <Typography
                        key={`cost-${idx}`}
                        sx={{
                          fontSize: '0.875rem ',
                          color: '#777777',
                          flexBasis: '75%',
                          marginBottom: '1rem',
                        }}
                      >
                        {text}
                      </Typography>
                    ))}
                  </Box>
                </Box>
                <Divider sx={{ marginBottom: '0.5rem' }} />
              </Box>
              <LoadingButton
                type="button"
                loading={loading}
                disabled={loading}
                fullWidth
                sx={{ marginBottom: '1rem' }}
                onClick={handleConfirmMed}
              >
                Select medication and continue
              </LoadingButton>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  gap: '1rem',
                }}
              >
                {details[medicationSelected]?.disclaimers?.map((text, idx) => (
                  <Typography
                    key={`disclaimer-${idx}`}
                    sx={{
                      fontSize: '0.7rem !important',
                      color: '#777777',
                      fontStyle: 'italic',
                    }}
                  >
                    {text}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </>
      )}

      {!medicationSelected && !review && !isBundlePatient ? (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            Confirm your preferred treatment option.
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {`By confirming your preferred treatment, your ${siteName} provider will be able to prescribe and order GLP-1 medication that is medically appropriate for you.`}
          </Typography>

          <Box sx={{ marginBottom: '3rem' }}>
            {compoundMedications.map((med, i) => (
              <Box
                key={`med-${i}`}
                sx={{
                  padding: '2rem 2.5rem 1rem 2.5rem',
                  borderRadius: '1rem',
                  background: '#ffffff',
                  boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '1rem',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.3rem !important',
                    fontWeight: '700',
                    lineHeight: '1.75rem',
                    letterSpacing: '0.00206',
                  }}
                >
                  {med.brand}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    marginBottom: '1.5rem',
                  }}
                >
                  {med.drug}
                </Typography>
                <Stack gap={2} mb={3}>
                  <Typography
                    style={{ whiteSpace: 'pre-wrap' }}
                    variant="body1"
                  >
                    {med.body1}
                  </Typography>
                  <Typography variant="body1">{med.body2}</Typography>
                  {med.body3 && (
                    <Typography variant="body1">{med.body3}</Typography>
                  )}
                </Stack>
                <Button onClick={() => selectMedication(med)}>
                  Review treatment
                </Button>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  {med?.disclaimers?.map((text, idx) => (
                    <Typography
                      key={`disclaimer-${idx}`}
                      sx={{
                        fontSize: '0.7rem !important',
                        color: '#777777',
                        fontStyle: 'italic',
                      }}
                    >
                      {text}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </>
      ) : null}

      {/* If you need a fallback for bundled pts:
      {!medicationSelected && !review && isBundlePatient ? (
        <RedirectToHome />
      ) : null}
      */}
    </Box>
  );
};

export default WeightLossTreatment;
