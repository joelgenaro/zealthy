import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  Checkbox,
  Stack,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import {
  MedicationAddOn,
  WeightLossBulkAddOn,
} from '@/components/shared/AddOnPayment';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  CompoundDetailProps,
  useAllVisiblePatientSubscription,
  useCompoundMatrix,
  usePatient,
  usePatientPrescriptions,
} from '@/components/hooks/data';
import {
  useNextDosage,
  useTitrationSelection,
} from '@/components/hooks/useTitrationSelection';
import { useTitrationSelectionLookup } from '@/components/hooks/useTitrationSelectionLookup';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { useAnswerState } from '@/components/hooks/useAnswer';
import { useVWOVariationName } from '@/components/hooks/data';
import { supabaseClient } from '@/lib/supabaseClient';
import { useMediaQuery } from '@mui/material';
import { useVWO } from '@/context/VWOContext';
import { usePatientState } from '@/components/hooks/usePatient';

type MedObjectProps = {
  name: string;
  type: MedicationType;
  price: number;
  discounted_price?: number;
  dosage: string;
  shipments: string;
  quantity: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
};

interface WeightLossMedicalProps {
  nextPage: (nextPage?: string) => void;
}

const WeightLossTreatmentBundled = ({ nextPage }: WeightLossMedicalProps) => {
  const { med } = Router.query;
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const complete = searchParams?.get('complete');
  const whatIsChecked = searchParams?.get('checked');
  const { addMedication } = useVisitActions();
  const { potentialInsurance } = useIntakeState();
  const [checked, setChecked] = useState<string>(whatIsChecked || '');
  const { data: patientSubscriptions } = useAllVisiblePatientSubscription();
  const { data: patient } = usePatient();
  const answers = useAnswerState();
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const [singlePlan, setSinglePlan] = useState<string | null>(null);
  const [bulkPlan, setBulkPlan] = useState<string | null>(null);
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { data: compoundMatrix } = useCompoundMatrix();
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const vwoContext = useVWO();
  const patientState = usePatientState();
  const variationName9057_2 = vwoContext?.getVariationName(
    '9057_2',
    String(patientState?.id)
  );
  const variationName9057_3 = vwoContext?.getVariationName(
    '9057_3',
    String(patientState?.id)
  );
  const variationName =
    medicationSelected === 'semaglutide'
      ? variationName9057_2
      : variationName9057_3;
  const getMediaUrl = (
    type: 'videos' | 'images',
    medication: string,
    orientation: string,
    isThumbnail = false
  ) => {
    const envPrefix =
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? '' : 'staging.';
    const baseUrl = `https://${envPrefix}api.getzealthy.com/storage/v1/object/public/${type}/`;
    const fileName = isThumbnail
      ? `announcements/${medication}-Bundled-${orientation}-Thumbnail.png`
      : `${medication}%20Bundled%20${orientation}.mp4`;
    return `${baseUrl}${fileName}`;
  };

  const getMediaUrls = (medication: string) => ({
    videos: {
      desktop: getMediaUrl('videos', medication, 'Horizontal'),
      mobile: getMediaUrl('videos', medication, 'Vertical'),
    },
    thumbnails: {
      desktop: getMediaUrl('images', medication, 'Horizontal', true),
      mobile: getMediaUrl('images', medication, 'Vertical', true),
    },
  });

  const semaMedia = getMediaUrls('Semaglutide');
  const tirzMedia = getMediaUrls('Tirz');

  const isMobile = useMediaQuery('(max-width:640px)');

  const getMediaBySelection = (mediaType: 'videos' | 'thumbnails') =>
    medicationSelected === 'semaglutide'
      ? semaMedia[mediaType][isMobile ? 'mobile' : 'desktop']
      : tirzMedia[mediaType][isMobile ? 'mobile' : 'desktop'];

  const videoUrl = getMediaBySelection('videos');
  const thumbnailUrl = getMediaBySelection('thumbnails');

  const next3MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_multi_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    true,
    answers
  );
  const next1MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_monthly',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    true,
    answers
  );

  function compareFn(a: any, b: any) {
    if (new Date(a.created_at) < new Date(b.created_at)) {
      return -1;
    } else if (new Date(a.created_at) > new Date(b.created_at)) {
      return 1;
    }
    return 0;
  }

  const glp1MedicationDose = useMemo(() => {
    const drug = (answers['WEIGHT_L_POST_Q12']?.answer as CodedAnswer[])?.[0]
      ?.valueCoding;
    const dosage = (
      answers?.[`${drug?.code}/WL_GLP_1_Q1`]?.answer as CodedAnswer[]
    )?.[0]?.valueCoding?.display;
    const withinMonth =
      (answers?.[`${drug?.code}/WL_GLP_1_Q2`]?.answer as CodedAnswer[])?.[0]
        ?.valueCoding?.display === 'Within the past month';
    return drug?.display?.length && dosage?.length && withinMonth
      ? { dosage, drug: drug?.display }
      : { dosage: null, drug: null };
  }, [answers]);

  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription =
    weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0];

  const handleChange = (value: string) => {
    setChecked(value);
    setShowVideo(true);
  };

  useEffect(() => {
    if (!med) {
      Router.push(
        {
          pathname:
            '/post-checkout/questionnaires-v2/weight-loss-bundled-treatment/WEIGHT-LOSS-BUNDLED-TREATMENT-A-Q1',
          query: {
            med: potentialInsurance?.split(' ')[0],
            quantity: true,
          },
        },
        undefined,
        { shallow: true }
      );
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [med]);

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

    if (checked === 'single' && medicationSelected && compoundDetails) {
      await supabaseClient
        .from('prescription_request')
        .update({
          matrix_id: compoundDetails[medicationSelected].medData?.matrixId!,
        })
        .eq('patient_id', patient?.id!)
        .eq('status', 'PRE_INTAKES');
      nextPage();
      return;
    }

    Router.push(
      {
        pathname:
          '/post-checkout/questionnaires-v2/weight-loss-bundled-treatment/WEIGHT-LOSS-BUNDLED-TREATMENT-A-Q1',
        query: {
          med: potentialInsurance?.split(' ')[0],
          review: true,
          checked,
        },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }

  const handleSkipButton = async () => {
    setChecked('single');
    if (!!medicationSelected && compoundDetails) {
      addMedication(compoundDetails[medicationSelected].medData);
    }

    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
    nextPage();
  };

  const listItems = [
    {
      title: 'Provider review: ',
      body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, your payment method will be charged and you will receive your fill shipped to your home.',
    },
    {
      title: 'Check your email and SMS: ',
      body: 'We’ll send you a message if your Provider has any questions or when your refill is ready at your pharmacy.',
    },
    {
      body: 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your refill.',
    },
  ];

  async function fetchCompoundDetails() {
    const object: CompoundDetailProps = {
      [`${medicationSelected}`]: {
        saving:
          weightLossSubscription?.price === 297
            ? 148
            : weightLossSubscription?.price === 449
            ? 180
            : Math.round(next1MonthDosage?.price! * 3 * 0.2),
        price:
          weightLossSubscription?.price === 297
            ? 297
            : weightLossSubscription?.price === 449
            ? 449
            : next1MonthDosage?.price!,
        discountedPrice: Math.ceil(
          weightLossSubscription?.price === 297
            ? 223
            : weightLossSubscription?.price === 449
            ? 359
            : next3MonthDosage?.price! / 3
        ),
        name: medicationSelected || '',
        title: `Get 3 months of ${medicationSelected?.toLowerCase()} + next 2 months of provider support`,
        singleTitle: `Stick with 1 month of ${medicationSelected?.toLowerCase()}`,
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
            : ''
        }`,
        singleDosage: `${next1MonthDosage?.med?.vial_size?.trim()}${
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
            : ''
        }`,
        singleDescription: `$${
          weightLossSubscription?.price === 297
            ? 297
            : weightLossSubscription?.price === 449
            ? 449
            : next1MonthDosage?.price
        } for your next month of ${medicationSelected}`,
        body1:
          'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
        body2: '',
        medData: {
          name: `${medicationSelected}`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price:
            weightLossSubscription?.price === 297
              ? 297
              : weightLossSubscription?.price === 449
              ? 449
              : next1MonthDosage?.price!,
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
              : ''
          }`,
          dose: next1MonthDosage?.med?.dose,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          medication_quantity_id: 98,
          matrixId: next1MonthDosage?.med.id!,
        },
        medBulkData: {
          name: `${medicationSelected}`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price:
            weightLossSubscription?.price === 297
              ? 297
              : weightLossSubscription?.price === 449
              ? 449
              : next3MonthDosage?.price!,
          discounted_price: Math.ceil(
            weightLossSubscription?.price === 297
              ? 223
              : weightLossSubscription?.price === 449
              ? 359
              : (next3MonthDosage?.price! / 3)!
          ),
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
              : ''
          }`,
          dose: next3MonthDosage?.med?.dose,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 98,
          matrixId: next3MonthDosage?.med.id!,
        },
      },
    };
    setCompoundDetails(object);
  }

  useEffect(() => {
    if (next1MonthDosage?.med && next3MonthDosage?.med) {
      fetchCompoundDetails();
    }
  }, [next1MonthDosage?.med, next3MonthDosage?.med]);

  return (
    <Container maxWidth="sm">
      {complete && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {'Your responses are being reviewed!'}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
            {
              'Your Zealthy Provider may reach out to you if they have any additional questions. Here’s what’s next:'
            }
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
      )}
      {review &&
        (checked === 'single' ? (
          <MedicationAddOn onNext={nextPage} />
        ) : (
          <WeightLossBulkAddOn onNext={nextPage} currentMonth={currMonth} />
        ))}
      {medicationSelected && !review && quantity && compoundDetails && (
        <Box>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            Upgrade to a 3-month supply.
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {`Purchase month 2 and 3 today for additional cost savings.  We'll send 3 vials with a total of ${compoundDetails[
              medicationSelected
            ]?.dosage.replace(
              'mgs',
              'mg'
            )} of ${medicationSelected.toLowerCase()} - enough medication for your first three months instead of just the first month. It includes the 3-month supply of medication plus two more months of medical care, coaching and coordination.`}
            <br />
            <br />
            You will be able to get a refund if not prescribed.
          </Typography>
          {variationName === 'Variation-1' && showVideo && (
            <Box sx={{ marginY: '2rem' }}>
              <Typography variant="subtitle1">
                Want to learn more about the Semaglutide + Doctor program at
                Zealthy from our Medical Director? Watch this video.
              </Typography>
              <video
                width="100%"
                controls
                style={{ borderRadius: '10px', marginTop: '1rem' }}
                poster={thumbnailUrl}
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
            >{`For a limited time save $${compoundDetails[medicationSelected]?.saving}`}</Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Checkbox
                value={checked}
                checked={checked === 'bulk'}
                inputProps={{ 'aria-label': 'controlled' }}
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
                    {compoundDetails[medicationSelected]?.title}
                  </Typography>
                  <Typography variant="body1" fontWeight="600" mb="1rem">
                    {`${
                      compoundDetails[medicationSelected]?.name
                    } ${compoundDetails[medicationSelected]?.dosage.replace(
                      'mgs',
                      'mg'
                    )}`}
                  </Typography>
                </Box>
                {/* <Box sx={{ display: "flex" }}> */}
                {compoundDetails[medicationSelected]?.saving && (
                  <Typography
                    mt={-1}
                    fontStyle={'italic'}
                    fontWeight={600}
                    mb={1}
                  >{`On average, people lose ${
                    compoundDetails[medicationSelected]?.name === 'Semaglutide'
                      ? '7'
                      : '8'
                  }% of their weight in their first three months of ${
                    compoundDetails[medicationSelected]?.name
                  }**`}</Typography>
                )}
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="1rem !important"
                >
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
                    {`$${compoundDetails[medicationSelected]?.price}/month`}
                  </Typography>
                  {`$${
                    compoundDetails[medicationSelected]?.discountedPrice
                  }/month for ${compoundDetails[
                    medicationSelected
                  ]?.name.toLowerCase()} (3 month supply)`}
                </Typography>
                {/* </Box> */}
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="0.75rem !important"
                >
                  {compoundDetails[medicationSelected]?.body1}
                </Typography>
                <Typography variant="body1" fontSize="0.75rem !important">
                  {compoundDetails[medicationSelected]?.body2}
                </Typography>
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
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Checkbox
                value={checked}
                checked={checked === 'single'}
                inputProps={{ 'aria-label': 'controlled' }}
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
                    {compoundDetails[medicationSelected].singleTitle}
                  </Typography>
                  <Typography variant="body1" fontWeight="600" mb="1rem">
                    {`${
                      compoundDetails[medicationSelected].name
                    } ${compoundDetails[
                      medicationSelected
                    ].singleDosage.replace('mgs', 'mg')}`}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="1rem !important"
                >
                  {`Included in what you paid for your first month of membership.
                  For most members, your ${compoundDetails[
                    medicationSelected
                  ].singleDosage.replace(
                    'mgs',
                    'mg'
                  )} vial will last for 1 month.`}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Stack gap={2}>
            <Button
              fullWidth
              onClick={handleConfirmQuantity}
              disabled={!checked.length}
            >
              Continue
            </Button>
            <Button fullWidth color="grey" onClick={handleSkipButton}>
              Skip
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default WeightLossTreatmentBundled;
