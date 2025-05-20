import {
  CompoundMatrixProps,
  useCompoundMatrix,
  usePatient,
  usePatientOrders,
  usePatientPrescriptions,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useAnswerState } from '@/components/hooks/useAnswer';
import { useNextDosage } from '@/components/hooks/useTitrationSelection';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import {
  MedicationAddOn,
  WeightLossBulkAddOn,
} from '@/components/shared/AddOnPayment';
import { WeightLossSixMonth } from '@/components/shared/AddOnPayment/WeightLossSixMonth/WeightLossSixMonth';
import { WeightLossTwelveMonth } from '@/components/shared/AddOnPayment/WeightLossTwelveMonth.tsx/WeightLossTwelveMonth';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Spinner from '@/components/shared/Loading/Spinner';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useVWO } from '@/context/VWOContext';
import { Questionnaire, QuestionWithName } from '@/types/questionnaire';
import {
  choseSemaglutideColoradoEvent,
  choseTirzepatideColoradoEvent,
} from '@/utils/freshpaint/events';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';
import Router from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { compoundMedications, details } from './data';
import WeightLossOptions from './WeightLossOptions';
import WeightLossOptions7861Var2 from './WeightLossOptions7861Var2';
import WeightLossOptions6315Var from './WeightLossOptions6315Var';

type MedProps = {
  brand: string;
  drug: string;
  body1: string;
  body2: string;
};
export type MedObjectProps = {
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
  vial_size?: string | null;
};

export type CompoundDetailProps = {
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
    medSixMonthData?: MedObjectProps;
    medTwelveMonthData?: MedObjectProps;
  };
};

type CheckedType = 'single' | 'bulk' | 'six-month' | 'twelve-month';

interface Props {
  videoUrl?: string;
  nextPage: (nextPage?: string) => void;
}
interface ChoiceProps {
  question: QuestionWithName;
  answer: CodedAnswer[];
  questionnaire: Questionnaire;
}

const WeightLossTreatment = ({ videoUrl, nextPage }: Props) => {
  const vwoClient = useVWO();
  const { resetQuestionnaires, addQuestionnaires, addCare } = useVisitActions();
  const { name, question_name, code } = Router.query;
  const [skipTitration, setSkipTitration] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const { addMedication } = useVisitActions();
  const checked = searchParams?.get('checked') ?? 'six-month';
  const [displayError, setDisplayError] = useState<boolean>(false);
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const { data: patientInfo } = usePatient();
  const { data: patientOrders, isFetched: orderFetched } = usePatientOrders();
  const [otherMedicationMedData, setOtherMedicationMedData] =
    useState<any>(null);
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { data: compoundMatrix } = useCompoundMatrix();
  const answers = useAnswerState();
  const { data: variation4798 } = useVWOVariationName('4798');
  const { data: variation9502, isLoading: variationIsLoading9502 } =
    useVWOVariationName('9502');
  const isSameDosage =
    answers?.WEIGHT_L_C_REFILL_Q3?.answer[0]?.valueCoding?.code ===
    'KEEP_DOSAGE';
  const { medications } = useVisitState();

  const activateVariant = async () => {};

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

  const next3MonthDosage = useNextDosage(
    patientInfo!,
    medicationSelected?.toLowerCase() + '_multi_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    isSameDosage
  );
  const next1MonthDosage = useNextDosage(
    patientInfo!,
    medicationSelected?.toLowerCase() + '_monthly',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    isSameDosage
  );
  const next6MonthDosage = useNextDosage(
    patientInfo!,
    medicationSelected?.toLowerCase() + '_six_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    isSameDosage
  );
  const next12MonthDosage = useNextDosage(
    patientInfo!,
    medicationSelected?.toLowerCase() + '_twelve_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    isSameDosage
  );

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

  const handleChange = (value: string) => {
    setDisplayError(false);
    Router.push(
      {
        query: {
          name,
          code,
          question_name,
          med: medicationSelected,
          quantity,
          checked: value,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  // useEffect(() => {
  //   if (
  //     (checked === 'six-month' ||
  //       checked === 'twelve-month' ||
  //       checked === 'bulk') &&
  //     next6MonthDosage?.med &&
  //     next12MonthDosage?.med &&
  //     !['Variation-1', 'Variation-2', 'Variation-3', 'Variation-5'].includes(
  //       variation8469?.variation_name ?? ''
  //     )
  //   ) {
  //     handleConfirmQuantity();
  //   }
  // }, [checked, next6MonthDosage?.med, next12MonthDosage?.med]);

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
      if (checked === 'six-month') {
        addMedication(compoundDetails?.[medicationSelected].medSixMonthData!);
      } else if (checked === 'twelve-month') {
        addMedication(
          compoundDetails?.[medicationSelected].medTwelveMonthData!
        );
      } else {
        addMedication(
          checked === 'bulk'
            ? compoundDetails?.[medicationSelected].medBulkData!
            : compoundDetails?.[medicationSelected].medData!
        );
      }
    }

    Router.push(
      {
        query: {
          name,
          code,
          question_name,
          med: medicationSelected,
          review: true,
          checked: checked,
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
        saving: Math.round(
          (135 - 108) * 2 +
            (next1MonthDosage?.price! * 3 - next3MonthDosage?.price!)
        ),
        name: medicationSelected || '',
        title:
          'Buy 3 month supply of medication & get 20% off for a limited time',
        singleTitle: 'Buy 1 month supply of medication',
        singleDescription: `$${next1MonthDosage?.price} for your next month of ${medicationSelected}`,
        body1:
          'You’ll get 20% off the next 3 months of your weight loss membership. This means your next 3 months of membership will be just $108/month.',
        body2:
          'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
        medData: {
          name: `${medicationSelected} weekly injections`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price: next1MonthDosage?.price!,
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
          matrixId: next1MonthDosage?.med?.id!,
          currMonth: next1MonthDosage?.med?.current_month!,
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
              price: next6MonthDosage?.price!,

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
              vial_size: next6MonthDosage?.med?.vial_size,
            }
          : undefined,
        medTwelveMonthData: next12MonthDosage?.med
          ? {
              name:
                medicationSelected === 'Oral Semaglutide'
                  ? medicationSelected
                  : `${medicationSelected} weekly injections`,
              type:
                medicationSelected === 'Oral Semaglutide'
                  ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
                  : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
              price: next12MonthDosage?.price!,

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
              vial_size: next12MonthDosage?.med?.vial_size,
            }
          : undefined,
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
          matrixId: next3MonthDosage?.med?.id!,
          currMonth: next3MonthDosage?.med?.current_month!,
        },
      },
    };
    setCompoundDetails(object);
  }

  useEffect(() => {
    if (next1MonthDosage?.med && next3MonthDosage?.med) {
      fetchCompoundDetails();
    }
  }, [
    next1MonthDosage?.med,
    next3MonthDosage?.med,
    skipTitration,
    medicationSelected,
  ]);

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

  const getPricePerMg = (entry: any) => {
    const totalMgs = entry.med?.vial_size?.split(' ')[0];
    return entry.price! / Number(totalMgs!);
  };

  const savingsPerMg = useMemo(() => {
    if (!next3MonthDosage?.med || !next1MonthDosage?.med) return 0;
    const threeMonthTotalMgs = Number(
      next3MonthDosage?.med?.vial_size?.split(' ')[0]
    );
    const threeMonthPricePerMg = getPricePerMg(next3MonthDosage);
    const oneMonthPricePerMg = getPricePerMg(next1MonthDosage);
    const savings =
      // 54 = (135 - 108) * 2
      (oneMonthPricePerMg - threeMonthPricePerMg) * threeMonthTotalMgs + 54;

    return savings;
  }, [next1MonthDosage, next3MonthDosage]);

  function updateCostString(str: string, newCost: number): string {
    if (!str) return str;
    return str.replace(/\$\d+/g, `$${newCost}`);
  }

  const semaglutideCompoundDetails = compoundDetails?.['Semaglutide'];
  const semaglutideDetails = details?.['Semaglutide'];

  const tirzepatideCompoundDetails = compoundDetails?.['Tirzepatide'];
  const tirzepatideDetails = details?.['Tirzepatide'];

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
        `As a Zealthy member, the cost of the medication is as little as $${cost}/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home, which is included in the price.`,
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
      '',
      semaglutideDetails,
      semaglutideCompoundDetails,
      semaglutide.cost,
      semaglutide.bulkCost,
      'Semaglutide'
    );
    updateDetails(
      '',
      tirzepatideDetails,
      tirzepatideCompoundDetails,
      tirzepatide.cost,
      tirzepatide.bulkCost,
      'Tirzepatide'
    );
  }

  const getPaymentComponent = useMemo(() => {
    if (!checked) return null;
    const components: Record<CheckedType, JSX.Element | null> = {
      single: (
        <MedicationAddOn videoUrl={videoUrl} onNext={nextPage} isRefill />
      ),
      bulk: (
        <WeightLossBulkAddOn
          videoUrl={videoUrl}
          onNext={nextPage}
          currentMonth={currMonth}
        />
      ),
      'six-month': (
        <WeightLossSixMonth
          videoUrl={videoUrl}
          onNext={nextPage}
          oneMonthPrice={next1MonthDosage?.price ?? 0}
        />
      ),
      'twelve-month': (
        <WeightLossTwelveMonth
          videoUrl={videoUrl}
          onNext={nextPage}
          oneMonthPrice={next1MonthDosage?.price ?? 0}
        />
      ),
    };
    return components[checked as CheckedType] ?? null;
  }, [checked, videoUrl, nextPage, currMonth, next1MonthDosage]);

  if (variationIsLoading9502) {
    return <Spinner />;
  } else {
    return variation9502?.variation_name === 'Variation-2' ? (
      <Container maxWidth="xs">
        {!compoundDetails ? (
          <Spinner />
        ) : (
          <WeightLossOptions6315Var
            videoUrl={videoUrl}
            displayError={displayError}
            compoundDetails={compoundDetails}
            handleChange={handleChange}
            handleConfirmQuantity={handleConfirmQuantity}
          />
        )}
        {<>{medications.length ? getPaymentComponent : null}</>}
      </Container>
    ) : (
      <Container maxWidth="xs">
        {review && <>{getPaymentComponent}</>}
        {medicationSelected &&
        (!next3MonthDosage || !next1MonthDosage || !compoundDetails) ? (
          <Spinner />
        ) : (
          <>
            {medicationSelected && !review && quantity && compoundDetails ? (
              compoundDetails[medicationSelected].medSixMonthData &&
              compoundDetails[medicationSelected].medTwelveMonthData ? (
                <WeightLossOptions7861Var2
                  videoUrl={videoUrl}
                  displayError={displayError}
                  compoundDetails={compoundDetails}
                  handleChange={handleChange}
                  handleConfirmQuantity={handleConfirmQuantity}
                />
              ) : (
                <WeightLossOptions
                  videoUrl={videoUrl}
                  displayError={displayError}
                  compoundDetails={compoundDetails}
                  handleChange={handleChange}
                  handleConfirmQuantity={handleConfirmQuantity}
                />
              )
            ) : null}
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
                  {details[medicationSelected]?.disclaimers?.map(
                    (text, idx) => (
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
                    )
                  )}
                </Box>
              </>
            )}
          </>
        )}
        {!medicationSelected && !review && (
          <>
            <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
              Confirm your preferred treatment option
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
                      style={{
                        whiteSpace: 'pre-wrap',
                      }}
                      variant="body1"
                    >
                      {med.body1}
                    </Typography>
                    <Typography variant="body1">{med.body2}</Typography>
                  </Stack>
                  <Button onClick={() => selectMedication(med)}>
                    Review treatment 3
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
                    {/* {med?.disclaimers?.map((text, idx) => (
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
                    ))} */}
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
  }
};

export default WeightLossTreatment;
