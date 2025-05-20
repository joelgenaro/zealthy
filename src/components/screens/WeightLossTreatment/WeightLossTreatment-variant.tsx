import {
  Container,
  Typography,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  Checkbox,
  Stack,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { compoundMedications, details } from './data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import {
  usePatient,
  usePatientPrescriptionRequest,
  useWeightLossSubscription,
} from '@/components/hooks/data';
import { MedicationAddOn } from '@/components/shared/AddOnPayment';
import { WeightLossBulkAddOn } from '@/components/shared/AddOnPayment/WeightLossBulk-variant';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { Pathnames } from '@/types/pathnames';
import BasicModal from '@/components/shared/BasicModal';
import { useTitrationSelection } from '@/components/hooks/useTitrationSelection';
import { useTitrationSelectionLookup } from '@/components/hooks/useTitrationSelectionLookup';
import Spinner from '@/components/shared/Loading/Spinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';

type MedProps = {
  brand: string;
  drug: string;
  body1: string;
  body2: string;
};

type MedObjectProps = {
  name: string;
  type: MedicationType;
  price: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
};

type CompoundDetailProps = {
  [key: string]: {
    saving: number;
    price: number;
    discountedPrice: number;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    singleDescription: string;
    name: string;
    body1: string;
    body2: string;
    medData: MedObjectProps;
    medBulkData: MedObjectProps;
  };
};

const WeightLossTreatment = () => {
  const { id } = Router.query;
  const { data: patient } = usePatient();
  const [loading, setLoading] = useState(false);
  const [weightLossLoading, setWeightLossLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const { addMedication } = useVisitActions();
  const [checked, setChecked] = useState<string>('');
  const { data: prescriptionRequests = [] } = usePatientPrescriptionRequest();
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const [singlePlan, setSinglePlan] = useState<string | null>(null);
  const [bulkPlan, setBulkPlan] = useState<string | null>(null);
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const {
    data: weightLossSubscription,
    isFetched: isFetchedWeightLossSubscription,
  } = useWeightLossSubscription();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );

  const { upsertActionItem } = useMutatePatientActionItems();

  const nextMed = useTitrationSelection();
  const singleMed = useTitrationSelectionLookup(
    medicationSelected as string,
    currMonth as number,
    singlePlan || (bulkPlan as string)
  );

  const isNotWeightLossUser = useMemo(() => {
    if (!isFetchedWeightLossSubscription) {
      return false;
    }

    if (!weightLossSubscription) {
      return true;
    }

    return weightLossSubscription.subscription?.name.includes('Coaching Only');
  }, [isFetchedWeightLossSubscription, weightLossSubscription]);

  const weightLossSignUp = useCallback(async () => {
    setWeightLossLoading(true);
    return createVisitAndNavigateAway([SpecificCareOption.WEIGHT_LOSS]);
  }, [createVisitAndNavigateAway]);

  const hasPendingCompoundWeightLossRequest = useMemo(() => {
    return (
      !!prescriptionRequests.length &&
      prescriptionRequests.some(request => {
        const medication = request.medication_quantity;
        return medication?.id === 98;
      })
    );
  }, [prescriptionRequests]);

  const handleChange = (value: string) => {
    setChecked(value);
  };

  async function handleConfirmMed() {
    setLoading(true);
    Router.push(
      {
        pathname: `/patient-portal/weight-loss-treatment/${id}`,
        query:
          id === 'compound'
            ? { med: medicationSelected, quantity: true }
            : { med: medicationSelected, review: true },
      },
      undefined,
      { shallow: true }
    );
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

    Router.push(
      {
        pathname: `/patient-portal/weight-loss-treatment/${id}`,
        query: {
          med: medicationSelected,
          review: true,
        },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }
  async function selectMedication(med: MedProps) {
    Router.push(
      {
        pathname: `/patient-portal/weight-loss-treatment/${id}`,
        query: { med: med.brand },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
  }
  const listItems = [
    {
      title: 'Prior authorization: ',
      body: 'Our insurance coordination team will submit your paperwork for your insurance to cover Wegovy.',
    },
    {
      title: 'Check your email and SMS: ',
      body: 'We’ll send you a message to let you know if your prior authorization was accepted and, if medically appropriate, your Zealthy provider will fill your prescription.',
    },
    {
      body: 'While you wait, you may chat with your coach or coordinator in our messaging portal if you have any questions.',
    },
  ];

  const updateAction = useCallback(
    async (patientId: number) => {
      upsertActionItem({
        patient_id: patientId,
        type: 'COMPOUND_MEDICATION_REQUEST',
        title: 'Complete your request for compound Semaglutide or Tirzepatide',
        body: 'Skip the insurance process and get semaglutide or tirzepatide shipped to you for as little as $151/month.',
        path: Router.asPath,
      });
    },
    [upsertActionItem]
  );

  useEffect(() => {
    if (!patient) return;

    updateAction(patient.id);
  }, [patient, updateAction]);

  async function fetchCompoundDetails() {
    const object: CompoundDetailProps = {
      [`${medicationSelected}`]: {
        saving: bulkPlan
          ? Math.round(
              (135 - 108) * 2 + (nextMed?.price * 3 - singleMed?.price)
            )
          : Math.round(
              (135 - 108) * 2 + (singleMed?.price * 3 - nextMed?.price)
            ),
        price: singlePlan ? singleMed?.price : nextMed?.price,
        discountedPrice: singlePlan ? nextMed?.price / 3 : singleMed?.price / 3,
        name: medicationSelected || '',
        title:
          'Buy 3 month supply of medication & get 20% off for a limited time',
        singleTitle: 'Buy 1 month supply of medication',
        dosage: bulkPlan
          ? `${singleMed?.med?.vial_size?.trim()}${
              singleMed.med?.shipment_breakdown?.length === 3 &&
              singleMed?.med?.pharmacy === 'Empower'
                ? ` (3 vials included - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed?.med?.shipment_breakdown?.length === 3 &&
                  singleMed?.med?.pharmacy !== 'Red Rock'
                ? ` (3 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed?.med?.shipment_breakdown?.length === 3 &&
                  singleMed?.med?.pharmacy === 'Red Rock'
                ? ` (3 shipments - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : ''
            }`
          : `${nextMed?.selectedMed?.vial_size?.trim()}${
              nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
              nextMed?.selectedMed?.pharmacy === 'Empower'
                ? ` (3 vials included - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                  nextMed?.selectedMed?.pharmacy !== 'Red Rock'
                ? ` (3 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                  nextMed?.selectedMed?.pharmacy === 'Red Rock'
                ? ` (3 shipments - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : ''
            }`,
        singleDosage: singlePlan
          ? `${singleMed?.med?.vial_size?.trim()}${
              singleMed?.med?.shipment_breakdown?.length === 3 &&
              singleMed?.med?.pharmacy === 'Empower'
                ? ` (3 vials included - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed?.med?.shipment_breakdown?.length === 3 &&
                  singleMed?.med?.pharmacy !== 'Red Rock'
                ? ` (3 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed?.med?.shipment_breakdown?.length === 3 &&
                  singleMed?.med?.pharmacy === 'Red Rock'
                ? ` (3 shipments - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : ''
            }`
          : `${nextMed?.selectedMed?.vial_size?.trim()}${
              nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
              nextMed?.selectedMed?.pharmacy === 'Empower'
                ? ` (3 vials included - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                  nextMed?.selectedMed?.pharmacy !== 'Red Rock'
                ? ` (3 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                  nextMed?.selectedMed?.pharmacy === 'Red Rock'
                ? ` (3 shipments - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : ''
            }`,
        singleDescription: `$${
          singlePlan ? singleMed?.price : nextMed?.price
        } for your next month of ${medicationSelected}`,
        body1:
          'You’ll get 20% off the next 3 months of your weight loss membership. This means your next 3 months of membership will be just $108/month.',
        body2:
          'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
        medData: {
          name: `${medicationSelected} weekly injections`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price: singlePlan ? singleMed.price : nextMed?.price,
          dosage: singlePlan
            ? `${singleMed?.med?.vial_size?.trim()}${
                singleMed?.med?.shipment_breakdown?.length === 3 &&
                singleMed?.med?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed?.med?.shipment_breakdown?.length === 3 &&
                    singleMed?.med?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed?.med?.shipment_breakdown?.length === 3 &&
                    singleMed?.med?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : ''
              }`
            : `${nextMed?.selectedMed?.vial_size?.trim()}${
                nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                nextMed?.selectedMed?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                    nextMed?.selectedMed?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                    nextMed?.selectedMed?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : ''
              }`,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          medication_quantity_id: 98,
        },
        medBulkData: {
          name: `${medicationSelected} weekly injections`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price: singlePlan ? singleMed.price : nextMed?.price,
          discounted_price: singlePlan
            ? nextMed?.price / 3
            : singleMed?.price / 3,
          dosage: singlePlan
            ? `${nextMed?.selectedMed?.vial_size?.trim()}${
                nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                nextMed?.selectedMed?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                    nextMed?.selectedMed?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                    nextMed?.selectedMed?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : ''
              }`
            : `${singleMed?.med?.vial_size?.trim()}${
                singleMed?.med?.shipment_breakdown?.length === 3 &&
                singleMed?.med?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed?.med?.shipment_breakdown?.length === 3 &&
                    singleMed?.med?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed?.med?.shipment_breakdown?.length === 3 &&
                    singleMed?.med?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : ''
              }`,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 98,
        },
      },
    };
    setCompoundDetails(object);
  }

  useEffect(() => {
    if (nextMed) {
      setCurrMonth(nextMed.currentMonth);
      let plan = nextMed.currentPlan;

      if (plan === 'semaglutide_multi_month') {
        setSinglePlan('semaglutide_monthly');
      }
      if (plan === 'semaglutide_monthly') {
        setBulkPlan('semaglutide_multi_month');
      }
      if (plan === 'semaglutide_monthly') {
        setBulkPlan('semaglutide_multi_month');
      }
      if (plan === 'tirzepatide_multi_month') {
        setSinglePlan('tirzepatide_monthly');
      }
      if (plan === 'tirzepatide_monthly') {
        setBulkPlan('tirzepatide_multi_month');
      }
      if (plan === 'tirzepatide_monthly') {
        setBulkPlan('tirzepatide_multi_month');
      }
    }
  }, [nextMed, singleMed?.med]);

  const Redirect = () => {
    useEffect(() => {
      Router.push(
        {
          pathname: `/patient-portal/weight-loss-treatment/${id}`,
          query:
            id === 'compound'
              ? { med: medicationSelected, quantity: true }
              : { med: medicationSelected, review: true },
        },
        undefined,
        { shallow: true }
      );
    }, [checked]);

    return <></>;
  };

  useEffect(() => {
    if (singleMed?.med && nextMed?.selectedMed) {
      fetchCompoundDetails();
    }
  }, [singleMed?.med, nextMed?.selectedMed]);

  return (
    <Container maxWidth="sm">
      {review &&
        (id === 'compound' ? (
          checked === 'single' ? (
            <MedicationAddOn />
          ) : checked === 'bulk' ? (
            <WeightLossBulkAddOn />
          ) : (
            <Box>
              <Redirect />
              <Spinner />
            </Box>
          )
        ) : (
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
        ))}
      {medicationSelected && (!nextMed || !singleMed || !compoundDetails) ? (
        <Spinner />
      ) : (
        <>
          {medicationSelected && !review && quantity && compoundDetails && (
            <Box>
              <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
                {'Tell us how much medication you’d like to receive.'}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
                For a limited time, Zealthy is offering a 20% discount on your
                medication and your membership moving forward.
              </Typography>

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
                    width: 'fit-content',
                    height: '3.25rem',
                    padding: '1rem 1.25rem',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    alignSelf: 'center',
                    fontWeight: 600,
                  }}
                >{`For a limited time save $104!`}</Box>
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
                      <Typography variant="body1" mb="1rem">
                        {`${
                          compoundDetails[medicationSelected].name
                        } ${compoundDetails[medicationSelected].dosage.replace(
                          'mgs',
                          'mg'
                        )}`}
                      </Typography>
                    </Box>
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
                        {`$${compoundDetails[medicationSelected].price}/month`}
                      </Typography>
                      {`$${compoundDetails[medicationSelected].discountedPrice}/month for ${compoundDetails[medicationSelected].name} (3 month supply)`}
                    </Typography>
                    <Typography
                      variant="body1"
                      mb="1rem"
                      fontSize="0.75rem !important"
                    >
                      {compoundDetails[medicationSelected].body1}
                    </Typography>
                    <Typography variant="body1" fontSize="0.75rem !important">
                      {compoundDetails[medicationSelected].body2}
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
                        {compoundDetails[medicationSelected].singleTitle}
                      </Typography>
                      <Typography variant="body1" mb="1rem">
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
                      {compoundDetails[medicationSelected].singleDescription}
                    </Typography>
                    {/* </Box> */}
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
      {!medicationSelected && !review && (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            Confirm your preferred treatment option.
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {
              'By confirming your preferred treatment, your Zealthy provider will be able to prescribe and order GLP-1 medication that is medically appropriate for you.'
            }
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
      )}
      <BasicModal
        isOpen={hasPendingCompoundWeightLossRequest}
        useMobileStyle={false}
      >
        <Typography variant="h3" textAlign="center">
          You have a pending request with our Zealthy care team for semaglutide
          or tirzepatide. Message your care team if you’d like to update your
          request or update Zealthy on the status of your request.
        </Typography>
        <Stack gap="10px">
          <Button
            size="small"
            onClick={() =>
              Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
            }
          >
            Message your care team
          </Button>
          <Button
            size="small"
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
          >
            Go home
          </Button>
        </Stack>
      </BasicModal>
      <BasicModal isOpen={isNotWeightLossUser} useMobileStyle={false}>
        <Typography variant="h2" textAlign="center">
          You must sign up for a weight loss membership at Zealthy to order
          semaglutide or tirzepatide.
        </Typography>
        <Typography textAlign="center">
          To order semaglutide or tirzepatide for as little as $151/month, you
          must sign up for a membership. For a limited time, your first month of
          membership is only $39.
        </Typography>

        <Stack gap="10px">
          <LoadingButton
            loading={weightLossLoading}
            disabled={weightLossLoading}
            size="small"
            onClick={weightLossSignUp}
          >
            Continue to sign up
          </LoadingButton>
          <Button
            size="small"
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
          >
            Go home
          </Button>
        </Stack>
      </BasicModal>
    </Container>
  );
};

export default WeightLossTreatment;
