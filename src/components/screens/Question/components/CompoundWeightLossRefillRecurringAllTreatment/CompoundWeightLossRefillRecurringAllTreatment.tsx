import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { compoundMedications, details } from './data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import {
  useCompoundMatrix,
  usePatient,
  usePatientOrders,
} from '@/components/hooks/data';
import {
  RecurringWeightLossMedicationAddOn,
  RecurringWeightLossBulkAddOn,
} from '@/components/shared/AddOnPayment';
import { useVisitActions } from '@/components/hooks/useVisit';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useTitrationSelection } from '@/components/hooks/useTitrationSelection';
import { useTitrationSelectionLookup } from '@/components/hooks/useTitrationSelectionLookup';
import Spinner from '@/components/shared/Loading/Spinner';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import UsStates from '@/constants/us-states';
import {
  choseSemaglutideColoradoEvent,
  choseTirzepatideColoradoEvent,
} from '@/utils/freshpaint/events';
import { useVWO } from '@/context/VWOContext';
import { capitalize } from '@/utils/capitalize';

type MedProps = {
  brand: string;
  drug: string;
  body1: string;
  body2: string;
  body3?: string;
  disclaimers?: string[];
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
interface Props {
  nextPage: (nextPage?: string) => void;
}

const WeightLossRefillRecurringAllTreatment = ({ nextPage }: Props) => {
  const vwoClient = useVWO();
  const { resetQuestionnaires, addQuestionnaires, addCare } = useVisitActions();
  const { name, question_name, code } = Router.query;
  const { data: patientOrders } = usePatientOrders();
  const [skipTitration, setSkipTitration] = useState<boolean>(false);
  const nextMed = useTitrationSelection(null, skipTitration);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const { addMedication } = useVisitActions();
  const [checked, setChecked] = useState<string>('');
  const [orderCount, setOrderCount] = useState<number>(0);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const [singlePlan, setSinglePlan] = useState<string | null>(null);
  const [bulkPlan, setBulkPlan] = useState<string | null>(null);
  const { data: patientInfo } = usePatient();
  const [displayMore, setDisplayMore] = useState<boolean>(false);
  const { data: compoundMatrixMed } = useCompoundMatrix();
  const [otherMedicationMedData, setOtherMedicationMedData] =
    useState<any>(null);

  let variationName = null;

  const activateVariant = async () => {
    if (
      vwoClient &&
      patientInfo?.id &&
      ['FL'].includes(patientInfo?.region || '')
    ) {
      variationName = await vwoClient?.activate('3463', patientInfo);
    }
  };

  useEffect(() => {
    activateVariant();
  }, [vwoClient, patientInfo?.id, patientInfo?.region]);

  const hasGLP1NonCompoundOrders = patientOrders?.some(o =>
    [
      'wegovy',
      'ozempic',
      'mounjaro',
      'saxenda',
      'zepbound',
      'rybelsus',
      'victoza',
      'trulicity',
      'zepbound',
    ].includes(o?.prescription?.medication?.split(' ')[0]?.toLowerCase() || '')
  );
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);

  const singleMed = useTitrationSelectionLookup(
    medicationSelected as string,
    currMonth as number,
    singlePlan || (bulkPlan as string)
  );

  const filteredCompoundMedications = compoundMatrixMed?.filter((med: any) => {
    return (
      med?.subscription_plan?.split('_')[0].toLowerCase() ===
        medicationSelected?.toLowerCase() &&
      med?.states?.includes(
        UsStates.find(s => s.abbreviation === patientInfo?.region)?.name
      ) &&
      med?.active &&
      med?.id !== nextMed?.selectedMed?.id &&
      med?.id !== singleMed?.med?.id
    );
  });

  const displayCorrectDosage = (med: any) => {
    return `${med?.vial_size?.trim()}${
      med?.duration_in_days === 90 && med?.number_of_vials === 2
        ? `2 ${medicationSelected} vials in 1 package (${med?.shipment_breakdown?.join(
            ', '
          )})`
        : med?.duration_in_days === 90 && med?.number_of_vials === 1
        ? `${medicationSelected} ${med?.med?.shipment_breakdown?.[0]} (1 vial)`
        : med?.shipment_breakdown?.length > 1 && med?.pharmacy === 'Empower'
        ? ` (${
            med?.shipment_breakdown?.length
          } vials included - ${med?.shipment_breakdown?.join(', ')})`
        : med?.shipment_breakdown?.length > 1 && med?.pharmacy !== 'Red Rock'
        ? ` (${
            med?.shipment_breakdown?.length
          } vials included in shipment - ${med?.shipment_breakdown?.join(
            ', '
          )})`
        : med?.shipment_breakdown?.length === 3 && med?.pharmacy === 'Red Rock'
        ? ` (3 shipments - ${med?.shipment_breakdown?.join(', ')})`
        : ''
    }`;
  };

  const handleOtherMedicationsMetaData = (med: any) => {
    const medData = {
      name: `${medicationSelected} weekly injections`,
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      price: med?.price,
      discounted_price:
        med?.shipment_breakdown?.length === 3 ? med?.price / 3 : false,
      dosage: `${med?.vial_size?.trim()}${
        med?.shipment_breakdown?.length > 1 && med?.pharmacy === 'Empower' // if this component is used again in the future, will need to replicate the logic from Weightlosstreatment for the shipment breakdown
          ? ` (${
              med?.shipment_breakdown?.length
            } vials included - ${med?.shipment_breakdown?.join(', ')})`
          : med?.shipment_breakdown?.length > 1 && med?.pharmacy !== 'Red Rock'
          ? ` (${
              med?.shipment_breakdown?.length
            } vials included in shipment - ${med?.shipment_breakdown?.join(
              ', '
            )})`
          : med?.shipment_breakdown?.length === 3 &&
            med?.pharmacy === 'Red Rock'
          ? ` (3 shipments - ${med?.shipment_breakdown?.join(', ')})`
          : ''
      }`,
      dose: med?.dose,
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: Math.floor((med?.duration_in_days || 30) / 30),
      },
      medication_quantity_id: 98,
    };
    setOtherMedicationMedData(medData);
  };

  const handleChange = (value: string) => {
    setDisplayError(false);
    setChecked(value);
  };

  async function handleConfirmMed() {
    setLoading(true);
    Router.push(
      {
        query: {
          name,
          code,
          question_name,
          med: medicationSelected,
          quantity: true,
        },
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

    if (!!medicationSelected && (compoundDetails || otherMedicationMedData)) {
      addMedication(
        checked === 'bulk'
          ? compoundDetails?.[medicationSelected].medBulkData
          : checked === 'single'
          ? compoundDetails?.[medicationSelected].medData
          : otherMedicationMedData
      );
    }

    Router.push(
      {
        query: {
          name,
          code,
          question_name,
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
        query: { name, code, question_name, med: med.brand },
      },
      undefined,
      { shallow: true }
    );
    if (patientInfo?.region === 'CO') {
      med.brand === 'Semaglutide'
        ? choseSemaglutideColoradoEvent(
            patientInfo?.profiles?.first_name || '',
            patientInfo?.profiles.last_name || '',
            patientInfo?.profiles.email || ''
          )
        : choseTirzepatideColoradoEvent(
            patientInfo?.profiles?.first_name || '',
            patientInfo?.profiles.last_name || '',
            patientInfo?.profiles.email || ''
          );
    }
    window.scrollTo({ top: 0, left: 0 });
  }
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
        discountedPrice: singlePlan
          ? Math.round(nextMed?.price / 3)
          : Math.round(singleMed?.price / 3),
        name: medicationSelected || '',
        title:
          'Buy 3 month supply of medication & get 20% off for a limited time',
        singleTitle: 'Buy 1 month supply of medication ',
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
                : singleMed.med?.number_of_vials === 2
                ? ` (2 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed.med?.number_of_vials === 1 &&
                  singleMed?.med?.duration_in_days === 90
                ? ` (1 vial for 3 month supply)`
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
                : singleMed.med?.number_of_vials === 2
                ? ` (2 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed.med?.number_of_vials === 1 &&
                  singleMed?.med?.duration_in_days === 90
                ? ` (1 vial for 3 month supply)`
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
                  : singleMed.med?.number_of_vials === 2
                  ? ` (2 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed.med?.number_of_vials === 1 &&
                    singleMed?.med?.duration_in_days === 90
                  ? ` (1 vial for 3 month supply)`
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
                  : singleMed.med?.number_of_vials === 2
                  ? ` (2 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed.med?.number_of_vials === 1 &&
                    singleMed?.med?.duration_in_days === 90
                  ? ` (1 vial for 3 month supply)`
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
  useEffect(() => {
    if (singleMed?.med && nextMed?.selectedMed) {
      fetchCompoundDetails();
    }
  }, [singleMed?.med, nextMed?.selectedMed, skipTitration]);
  const sortMedications = (medications: MedProps[], preferredMed: string) => {
    if (!preferredMed) return medications;
    // Find the index of the preferred medication
    const preferredIndex = medications.findIndex(
      medication =>
        medication.brand?.toLowerCase() === preferredMed.toLowerCase()
    );

    // If the preferred medication is found, move it to the front
    if (preferredIndex !== -1) {
      const preferredMedication = medications[preferredIndex];
      medications.splice(preferredIndex, 1);
      medications.unshift(preferredMedication);
    }

    return medications;
  };
  async function handleGLP1Refill() {
    resetQuestionnaires();
    addQuestionnaires(mapCareToQuestionnaires(['Weight Loss Refill']));
    Router.push('/patient-portal/questionnaires-v2/weight-loss-refill');
  }
  const medName =
    patientOrders
      ?.find(o =>
        ['semaglutide', 'tirzepatide']?.includes(
          o?.prescription?.medication?.toLowerCase()?.split(' ')?.[0] || ''
        )
      )
      ?.prescription?.medication?.split(' ')?.[0] || '';

  const handleDisplay = () => {
    setDisplayMore(displayMore => !displayMore);
  };

  return (
    <Container maxWidth="xs">
      {review && (
        <>
          {!checked.includes('bulk') ? (
            <RecurringWeightLossMedicationAddOn onNext={nextPage} />
          ) : (
            <RecurringWeightLossBulkAddOn onNext={nextPage} />
          )}
        </>
      )}
      {medicationSelected && (!nextMed || !singleMed || !compoundDetails) ? (
        <Spinner />
      ) : patientInfo?.region == 'CO' || !!code?.length ? (
        <>
          {medicationSelected && !review && quantity && compoundDetails && (
            <Box>
              <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
                {`Tell us how much ${medicationSelected} you’d like to receive.`}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
                For a limited time, Zealthy is offering a 20% discount on your
                next 2 months of membership if you get a 3 month supply.
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
                    width: '17rem',
                    height: '3.25rem',
                    padding: '1rem 1.25rem',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    alignSelf: 'center',
                    fontWeight: 600,
                  }}
                >{`For a limited time save $${compoundDetails[medicationSelected].saving}`}</Box>
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
              <Collapse in={displayMore}>
                {filteredCompoundMedications?.map(medication => (
                  <Box
                    key={`${medication?.id}`}
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
                    onClick={() => {
                      handleOtherMedicationsMetaData(medication);
                      handleChange(
                        medication?.shipment_breakdown?.length === 3
                          ? `bulk${medication?.id}`
                          : `single${medication?.id}`
                      );
                    }}
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
                        checked={
                          medication?.shipment_breakdown?.length === 3
                            ? checked === `bulk${medication?.id}`
                            : checked === `single${medication?.id}`
                        }
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
                            {medication?.shipment_breakdown?.length === 3
                              ? 'Buy 3 month supply of medication'
                              : 'Buy 1 month supply of medication'}
                          </Typography>
                          <Typography variant="body1" mb="1rem">
                            {`${
                              medicationSelected || ''
                            } ${displayCorrectDosage(medication)?.replace(
                              'mgs',
                              'mg'
                            )}`}
                          </Typography>
                        </Box>
                        {medication?.shipment_breakdown?.length === 3 ? (
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
                            {`$${Math.round(
                              medication?.price / 3
                            )}/month for ${capitalize(
                              medication.subscription_plan?.split('_')[0]
                            )} (3 month supply)`}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body1"
                            mb="1rem"
                            fontSize="1rem !important"
                          >
                            {`$${medication?.price}
                            for your next month of ${medicationSelected}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Collapse>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#000000',
                }}
                onClick={handleDisplay}
              >
                <Typography sx={{ fontWeight: '600' }}>
                  See more options
                </Typography>
                <Icon sx={{ color: '#000000' }}>
                  {displayMore ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </Icon>
              </Box>
              <br></br>
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
      ) : (
        <>
          {medicationSelected && !review && quantity && compoundDetails && (
            <Box>
              <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
                {'Tell us how much medication you’d like to receive.'}
              </Typography>
              <Stack spacing={2} mb={3}>
                <Typography variant="subtitle1">
                  For a limited time, Zealthy is offering a 20% discount on your
                  next 3 months of membership if you get a 3 month supply.
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
                >{`For a limited time save $${compoundDetails[medicationSelected].saving}`}</Box>
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
            {sortMedications(compoundMedications, medName)?.map((med, i) => (
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
                {i === 0 && medName ? (
                  <Box
                    sx={{
                      borderRadius: '2.25rem',
                      background: '#B8F5CC',
                      padding: '0.25rem 1rem',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Typography fontWeight={600}>
                      {'Recommended for you (your current Rx)'}
                    </Typography>
                  </Box>
                ) : null}
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
            {hasGLP1NonCompoundOrders ? (
              <Button
                fullWidth
                sx={{ marginTop: '1rem' }}
                onClick={handleGLP1Refill}
              >
                Skip order and request brand name GLP-1
              </Button>
            ) : null}
          </Box>
        </>
      )}
    </Container>
  );
};

export default WeightLossRefillRecurringAllTreatment;
