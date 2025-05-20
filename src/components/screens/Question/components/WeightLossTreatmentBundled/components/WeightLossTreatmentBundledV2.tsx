import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  Stack,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
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
  CompoundMatrixProps,
  useAllVisiblePatientSubscription,
  useCompoundMatrix,
  usePatient,
  usePatientPrescriptions,
} from '@/components/hooks/data';
import { useNextDosage } from '@/components/hooks/useTitrationSelection';
import WeightLossBulkYearAddOn from './WeightLossBulkYearAddOn';
import QuantityCheckBox from './QuantityCheckbox';
import { useAnswerState } from '@/components/hooks/useAnswer';
import { supabaseClient } from '@/lib/supabaseClient';
import { CompoundDetailProps } from '@/components/screens/Question/components/WeightLossTreatment/WeightLossTreatment';
import WeightLossBulkSixMonthAddOn from '@/components/screens/Question/components/WeightLossTreatmentBundled/components/WeightLossBulkSixMonthAddOn';

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
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const [singlePlan, setSinglePlan] = useState<string | null>(null);
  const [bulkPlan, setBulkPlan] = useState<string | null>(null);
  const answers = useAnswerState();
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { data: compoundMatrix } = useCompoundMatrix();

  const getShipmentText = useCallback(
    (med: CompoundMatrixProps): string => {
      const idxToString = ['first', 'second', 'third', 'fourth'];
      const compoundMeds = compoundMatrix
        ?.find(row => row.id === med.id)
        ?.compound_option.map(option => {
          return option.compound_medication;
        });
      const medsByThreeMonthSupplies = new Array(med.duration_in_days! / 90)
        .fill(0)
        .map(_ => new Array());
      let month = 0;

      // Group vials by 3 month order
      compoundMeds?.forEach((medOption, idx) => {
        const vialMgs = Number(
          (med.shipment_breakdown![idx] as string).split(' ')[0]
        );
        month += medOption.duration_in_days! / 30;
        medsByThreeMonthSupplies[Math.floor((month - 1) / 3)].push(vialMgs);
      });

      // Generate string
      return medsByThreeMonthSupplies
        ?.reduce((sections, vials, idx) => {
          const sum = vials.reduce((sum, mgs) => sum + mgs, 0);
          sections.push(
            `${sum} mg (${vials.length} vial${
              vials.length > 1 ? 's' : ''
            } for ${idxToString[idx]} 3 month supply)`
          );
          return sections;
        }, [])!
        .join(', ');
    },
    [compoundMatrix]
  );

  const next12MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_twelve_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    true,
    answers
  );
  const next6MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_six_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    true,
    answers
  );
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
  console.log(med);
  console.log(medicationSelected);

  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription =
    weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0];

  const handleChange = (value: string) => {
    setChecked(value);
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
        checked === 'year'
          ? {
              ...compoundDetails[medicationSelected].medTwelveMonthData!,
              price: medicationSelected === 'Semaglutide' ? 3267 : 4939,
              discounted_price:
                medicationSelected === 'Semaglutide' ? 1969 : 2963,
              recurring: {
                interval: 'month',
                interval_count: 12,
              },
            }
          : checked === '6month'
          ? {
              ...compoundDetails[medicationSelected].medSixMonthData!,
              price: medicationSelected === 'Semaglutide' ? 1485 : 2245,
              discounted_price:
                medicationSelected === 'Semaglutide' ? 1045 : 1033,
              recurring: {
                interval: 'month',
                interval_count: 6,
              },
            }
          : checked === 'bulk'
          ? compoundDetails[medicationSelected].medBulkData
          : compoundDetails[medicationSelected].medData
      );
    }

    if (checked === 'single' && compoundDetails && medicationSelected) {
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
            ? 90
            : weightLossSubscription?.price === 449
            ? 90
            : Math.round(next1MonthDosage?.price! * 3 * 0.1),
        // @ts-ignore
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
            ? 337
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
        medSixMonthData: next6MonthDosage?.med
          ? {
              name:
                medicationSelected === 'Oral Semaglutide'
                  ? medicationSelected
                  : `${medicationSelected} weekly injections`,
              type:
                medicationSelected === 'Oral Semaglutide'
                  ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
                  : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
              price: next6MonthDosage?.price,

              discounted_price: next6MonthDosage?.price! / 6,
              dosage:
                medicationSelected === 'Oral Semaglutide'
                  ? '18 mg (3 bottles included - 3 mg, 6 mg, 9 mg)'
                  : `${getShipmentText(next6MonthDosage?.med!)}`,
              dose: `${next6MonthDosage?.med?.dose}`,
              quantity: 1,
              recurring: {
                interval: 'month',
                interval_count: 6,
              },
              medication_quantity_id: 98,
              currMonth: next6MonthDosage?.currentMonth,
              matrixId: next6MonthDosage?.med?.id!,
            }
          : undefined,
        medTwelveMonthData: next12MonthDosage?.med
          ? {
              name: medicationSelected,
              type:
                medicationSelected === 'Oral Semaglutide'
                  ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
                  : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
              price: next12MonthDosage?.price,

              discounted_price: next12MonthDosage?.price! / 12,
              dosage:
                medicationSelected === 'Oral Semaglutide'
                  ? '18 mg (3 bottles included - 3 mg, 6 mg, 9 mg)'
                  : `${getShipmentText(next12MonthDosage?.med!)}`,
              dose: `${next12MonthDosage?.med?.dose}`,
              quantity: 1,
              recurring: {
                interval: 'month',
                interval_count: 12,
              },
              medication_quantity_id: 98,
              currMonth: next12MonthDosage?.currentMonth,
              matrixId: next12MonthDosage?.med?.id!,
            }
          : undefined,
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
              ? 267
              : weightLossSubscription?.price === 449
              ? 404
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
    if (
      next1MonthDosage?.med &&
      next3MonthDosage?.med &&
      next6MonthDosage?.med &&
      next12MonthDosage?.med
    ) {
      fetchCompoundDetails();
    }
  }, [
    next1MonthDosage?.med,
    next3MonthDosage?.med,
    next6MonthDosage?.med,
    next12MonthDosage?.med,
  ]);

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
        ) : checked === 'year' ? (
          <WeightLossBulkYearAddOn onNext={nextPage} />
        ) : checked === '6month' ? (
          <WeightLossBulkSixMonthAddOn onNext={nextPage} />
        ) : (
          <WeightLossBulkAddOn onNext={nextPage} currentMonth={currMonth} />
        ))}
      {medicationSelected && !review && quantity && compoundDetails && (
        <Stack gap="1rem">
          <Typography variant="h2">
            Upgrade to an annual, 6-month, or 3-month membership.
          </Typography>
          <Typography variant="subtitle1">
            {`Purchase additional months to lock savings of up to 20%.`}
            <br />
            <br />
            You will be able to get a refund if not prescribed.
          </Typography>
          {compoundDetails[medicationSelected] ? (
            <Stack gap="1rem">
              {['year', '6month', 'bulk', 'single'].map(type => (
                <QuantityCheckBox
                  key={type}
                  type={type}
                  checked={checked}
                  // @ts-ignore
                  medication={compoundDetails[medicationSelected]}
                  onClick={handleChange}
                />
              ))}
            </Stack>
          ) : null}
          <Stack gap={2} marginTop="2rem">
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
        </Stack>
      )}
    </Container>
  );
};

export default WeightLossTreatmentBundled;
