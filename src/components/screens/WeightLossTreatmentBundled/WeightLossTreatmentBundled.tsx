import { Container, Typography, Button, Box, Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import {
  MedicationAddOn,
  WeightLossBulkAddOn,
} from '@/components/shared/AddOnPayment';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import {
  useAllVisiblePatientSubscription,
  useOralGlpTitration,
} from '@/components/hooks/data';
import { useTitrationSelection } from '@/components/hooks/useTitrationSelection';
import { useTitrationSelectionLookup } from '@/components/hooks/useTitrationSelectionLookup';
import Spinner from '@/components/shared/Loading/Spinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

function compareFn(a: any, b: any) {
  if (new Date(a.created_at) < new Date(b.created_at)) {
    return -1;
  } else if (new Date(a.created_at) > new Date(b.created_at)) {
    return 1;
  }
  return 0;
}

type MedObjectProps = {
  name: string;
  type: MedicationType;
  price: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  dose?: string | null;
  capsule_dosage?: string | null;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
  matrixId?: number;
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
    matrixId?: number;
  };
};
const WeightLossTreatmentBundled = ({
  nextPage,
}: {
  nextPage?: (nextPage?: string) => void;
}) => {
  const { med } = Router.query;
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected =
    (med as string)?.slice(0, 1)?.toUpperCase() + med?.slice(1);
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const { addMedication } = useVisitActions();
  const [checked, setChecked] = useState<string>('');
  const { data: patientSubscriptions } = useAllVisiblePatientSubscription();
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const [singlePlan, setSinglePlan] = useState<string | null>(null);
  const [bulkPlan, setBulkPlan] = useState<string | null>(null);
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);
  const [displayError, setDisplayError] = useState<boolean>(false);

  const nextMed = useTitrationSelection();
  const singleMed = useTitrationSelectionLookup(
    medicationSelected as string,
    currMonth as number,
    singlePlan || (bulkPlan as string)
  );
  const { data: oralGlpData } = useOralGlpTitration(90);
  const { data: oralGlpDataSingle } = useOralGlpTitration(30);

  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription =
    weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0];

  const handleChange = (value: string) => {
    setChecked(value);
  };

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
        pathname: Router.asPath.includes('weight-loss-bundle-reorder')
          ? `/patient-portal/questionnaires-v2/weight-loss-bundle-reorder/TREATMENT_OPTIONS`
          : `/patient-portal/weight-loss-treatment/bundled/${med}`,
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

  useEffect(() => {
    if (med && !Router.asPath.includes('weight-loss-bundle-reorder')) {
      setChecked('bulk');
      handleConfirmQuantity();
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [med, compoundDetails]);

  useEffect(() => {
    if (!med) {
      if (weightLossSubscription?.price === 297) {
        Router.push(
          {
            pathname: `/patient-portal/questionnaires-v2/weight-loss-bundle-reorder/TREATMENT_OPTIONS`,
            query: { med: 'Semaglutide', quantity: true },
          },
          undefined,
          { shallow: true }
        );
      } else if (weightLossSubscription?.price === 249) {
        Router.push(
          {
            pathname: `/patient-portal/questionnaires-v2/weight-loss-bundle-reorder/TREATMENT_OPTIONS`,
            query: { med: 'Oral Semaglutide', quantity: true },
          },
          undefined,
          { shallow: true }
        );
      } else if (weightLossSubscription?.price === 449) {
        Router.push(
          {
            pathname: `/patient-portal/questionnaires-v2/weight-loss-bundle-reorder/TREATMENT_OPTIONS`,
            query: { med: 'Tirzepatide', quantity: true },
          },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [weightLossSubscription, med]);

  const getCorrectDosage = (capsuleCount: number) => {
    switch (capsuleCount) {
      case 12:
        return 'take 3 capsules per week';
      case 20:
        return 'take 5 capsules per week';
      case 30:
        return 'take 1 capsule per day';
      default:
        return 'take 1 capsule per day';
    }
  };

  async function fetchCompoundDetails() {
    if (medicationSelected === 'Oral Semaglutide') {
      if (!oralGlpData || !oralGlpDataSingle) {
        return;
      }
      return setCompoundDetails({
        ['Oral Semaglutide']: {
          saving: 148,
          price: oralGlpData?.price!,
          discountedPrice: 200,
          title: 'Oral Semaglutide',
          singleTitle: '1 month supply of medication',
          dosage: `${oralGlpData
            ?.dose!.reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0
            )
            .toString()} mg`,
          singleDosage: `${
            oralGlpDataSingle?.dose && oralGlpDataSingle?.dose[0]
          } mg`,
          singleDescription: 'Included in membership',
          name: 'Oral Semaglutide',
          body1:
            'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
          body2: '',
          medData: {
            name: 'Oral Semaglutide',
            price: oralGlpDataSingle?.price!,
            dosage: `${
              oralGlpDataSingle?.dose && oralGlpDataSingle?.dose[0]
            } mg`,
            dose: oralGlpDataSingle?.dosage,
            capsule_dosage:
              oralGlpDataSingle?.capsuleCount &&
              `(${
                oralGlpDataSingle?.capsuleCount[0]
              } capsules total - ${getCorrectDosage(
                oralGlpDataSingle?.capsuleCount![0]
              )})`,
            quantity: 1,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            medication_quantity_id: 98,
            type: MedicationType.WEIGHT_LOSS_GLP1_ORAL,
            matrixId: oralGlpDataSingle?.rowId,
          },
          medBulkData: {
            name: 'Oral Semaglutide',
            price: oralGlpData?.price!,
            dosage: `${oralGlpData
              ?.dose!.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
              )
              .toString()} mg`,
            dose: oralGlpData?.dosage,
            capsule_dosage: `(${oralGlpData
              ?.capsuleCount!.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
              )
              .toString()} capsules total - ${getCorrectDosage(
              oralGlpData?.capsuleCount![0]
            )} for month 1, ${getCorrectDosage(
              oralGlpData?.capsuleCount![1]
            )} for month 2, and ${getCorrectDosage(
              oralGlpData?.capsuleCount![2]
            )} for month 3)`,
            quantity: 3,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            medication_quantity_id: 98,
            type: MedicationType.WEIGHT_LOSS_GLP1_ORAL,
            matrixId: oralGlpData?.rowId,
          },
          matrixId: oralGlpData?.rowId,
        },
      });
    }
    const object: CompoundDetailProps = {
      [`${medicationSelected}`]: {
        saving:
          weightLossSubscription?.price === 297
            ? 148
            : weightLossSubscription?.price === 449
            ? 180
            : bulkPlan
            ? Math.round(singleMed?.price * 3 * 0.2)
            : Math.round(nextMed?.price * 3 * 0.2),
        price:
          weightLossSubscription?.price === 297
            ? 297
            : weightLossSubscription?.price === 449
            ? 449
            : weightLossSubscription?.price === 249
            ? 249
            : singlePlan
            ? nextMed?.price
            : singleMed?.price,
        discountedPrice: Math.ceil(
          weightLossSubscription?.price === 297
            ? 223
            : weightLossSubscription?.price === 449
            ? 359
            : weightLossSubscription?.price === 249
            ? 200
            : singlePlan
            ? nextMed?.price / 3
            : singleMed?.price / 3
        ),
        name: medicationSelected || '',
        title:
          'Get 3 month supply of semaglutide + next 2 months of provider support',
        singleTitle: '1 month supply of medication',
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
                ? ``
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
                : nextMed.selectedMed?.number_of_vials === 2
                ? ` (2 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed.selectedMed?.number_of_vials === 1 &&
                  nextMed?.selectedMed?.duration_in_days === 90
                ? ``
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
                ? ``
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
                : nextMed.selectedMed?.number_of_vials === 2
                ? ` (2 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed.selectedMed?.number_of_vials === 1 &&
                  nextMed?.selectedMed?.duration_in_days === 90
                ? ``
                : ''
            }`,
        singleDescription: `Included in membership`,
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
              : weightLossSubscription?.price === 249
              ? 249
              : singlePlan
              ? singleMed.price
              : nextMed?.price,
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
                  ? ``
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
                  : nextMed.selectedMed?.number_of_vials === 2
                  ? ` (2 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed.selectedMed?.number_of_vials === 1 &&
                    nextMed?.selectedMed?.duration_in_days === 90
                  ? ``
                  : ''
              }`,
          dose: singlePlan ? singleMed?.med?.dose : nextMed?.selectedMed?.dose,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          medication_quantity_id: 98,
        },
        medBulkData: {
          name: `${medicationSelected}`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price:
            weightLossSubscription?.price === 297
              ? 297
              : weightLossSubscription?.price === 449
              ? 449
              : weightLossSubscription?.price === 249
              ? 249
              : singlePlan
              ? nextMed?.price
              : singleMed.price,
          discounted_price: Math.ceil(
            weightLossSubscription?.price === 297
              ? 223
              : weightLossSubscription?.price === 449
              ? 359
              : weightLossSubscription?.price === 249
              ? 400
              : singlePlan
              ? nextMed?.price / 3
              : singleMed?.price / 3
          ),
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
                  : nextMed.selectedMed?.number_of_vials === 2
                  ? ` (2 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed.selectedMed?.number_of_vials === 1 &&
                    nextMed?.selectedMed?.duration_in_days === 90
                  ? ``
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
                  ? ``
                  : ''
              }`,
          dose: singlePlan ? nextMed?.selectedMed?.dose : singleMed?.med?.dose,
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
    if (
      (medicationSelected === 'Oral Semaglutide' && oralGlpData) ||
      (medicationSelected !== 'Oral Semaglutide' &&
        singleMed?.med &&
        nextMed?.selectedMed)
    ) {
      fetchCompoundDetails();
    }
  }, [singleMed?.med, nextMed?.selectedMed, oralGlpData, oralGlpDataSingle]);

  return (
    <Container maxWidth="sm">
      {review &&
        (checked === 'single' ? (
          <MedicationAddOn onNext={nextPage} />
        ) : (
          <WeightLossBulkAddOn onNext={nextPage} currentMonth={currMonth} />
        ))}
      {!medicationSelected && !review && !quantity ? (
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <Spinner />
        </Box>
      ) : null}
      {medicationSelected && (!nextMed || !singleMed || !compoundDetails) ? (
        <Spinner />
      ) : (
        <>
          {medicationSelected && !review && quantity && compoundDetails ? (
            <Box>
              <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
                {'Tell us how much medication you’d like to receive.'}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
                By opting in to the next 2 months of lasting weight loss at
                Zealthy, you can get a 3 month supply of medication upfront.
                This is required to ensure that you will be able to continue to
                get your medical care while you use semaglutide to lose 15% of
                your body weight on average.
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
                        {compoundDetails[medicationSelected].title ===
                        'Oral Semaglutide'
                          ? 'Get 3 month supply of semaglutide + next 2 months of provider support'
                          : compoundDetails[medicationSelected].title}
                      </Typography>
                      <Typography variant="body1" mb="1rem">
                        {`${
                          compoundDetails[medicationSelected].name
                        } ${compoundDetails[medicationSelected].dosage.replace(
                          'mgs',
                          'mg'
                        )}`}
                      </Typography>
                      {compoundDetails[medicationSelected].name ===
                        'Oral Semaglutide' && (
                        <Typography variant="body1" mb="1rem">
                          {
                            compoundDetails[medicationSelected].medBulkData
                              .capsule_dosage
                          }
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      mb="1rem"
                      fontSize="1rem !important"
                    >
                      {compoundDetails[medicationSelected].price >
                        compoundDetails[medicationSelected].discountedPrice && (
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
                      )}
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
                      {compoundDetails[medicationSelected].title ===
                        'Oral Semaglutide' && (
                        <Typography variant="body1" mb="1rem">
                          {
                            compoundDetails[medicationSelected].medData
                              .capsule_dosage
                          }
                        </Typography>
                      )}
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
          ) : null}
        </>
      )}
    </Container>
  );
};

export default WeightLossTreatmentBundled;
