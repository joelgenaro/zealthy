import router, { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import CheckMark from '@/components/shared/icons/CheckMark';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  CompoundMatrixProps,
  useCompoundMatrix,
  usePatient,
  usePatientOrders,
  usePatientPrescriptions,
  useVWOVariationName,
} from '../../../../../hooks/data';
import { useState, useEffect } from 'react';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import toast from 'react-hot-toast';
import Spinner from '@/components/shared/Loading/Spinner';
import { useNextDosage } from '@/components/hooks/useTitrationSelection';
import ConsultationSelection from '../../ConsultationSelection/ConsultationSelection';
import { useVWO } from '@/context/VWOContext';

interface ChoiceItemProps {
  item: QuestionnaireQuestionAnswerOptions;
  handleItem: (item: QuestionnaireQuestionAnswerOptions) => void;
  answer: CodedAnswer[];
}

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

const DosageChoiceItem = ({ item, handleItem, answer }: ChoiceItemProps) => {
  /// this file handles selecting titration in the refill flow, depending on the answer 'keep dosage' vs 'increase dosage'
  const isSelected = useMemo(
    () => !!answer?.find(ans => ans?.valueCoding?.code === item?.code),
    [answer, item?.code]
  );
  const router = useRouter();
  const { data: variation4798 } = useVWOVariationName('4798');
  const { data: patientInfo } = usePatient();
  const { data: patientPrescriptions, isLoading: prescriptionsLoading } =
    usePatientPrescriptions();
  const { addMedication } = useVisitActions();
  const { data: compoundMatrix, isLoading: compoundMatrixLoading } =
    useCompoundMatrix();
  const { medications } = useVisitState();
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);

  const { data: variation9502 } = useVWOVariationName('9502');

  const mostRecentCompoundPrescription = patientPrescriptions
    ?.sort((presc1, presc2) => {
      return presc1.created_at! > presc2.created_at! ? -1 : 1;
    })
    .filter(presc => presc.matrix_id)[0];

  const onHighestDosage = useMemo(() => {
    if (prescriptionsLoading || compoundMatrixLoading) {
      return;
    }
    const months = patientPrescriptions?.map(presc => {
      if (!presc.matrix_id) {
        return 0;
      }
      if (presc.matrix_id.subscription_plan?.includes('multi_month')) {
        return presc.matrix_id.current_month! + 2;
      } else if (presc.matrix_id.subscription_plan?.includes('six_month')) {
        return presc.matrix_id.current_month! + 5;
      } else if (presc.matrix_id.subscription_plan?.includes('twelve_month')) {
        return presc.matrix_id.current_month! + 11;
      } else {
        return presc.matrix_id.current_month;
      }
    });
    const highestMonth = Math.max(...(months as number[]));

    //Capping dosage for this ab test
    if (
      ['Variation-1', 'Variation-2'].includes(
        variation4798?.variation_name ?? ''
      ) &&
      highestMonth >= 4
    ) {
      return true;
    }

    // All plans will be at highest dosage months 6 onwards
    return highestMonth >= 6;
  }, [
    mostRecentCompoundPrescription,
    item.code,
    prescriptionsLoading,
    compoundMatrixLoading,
    variation4798?.variation_name,
  ]);

  const medicationSelected =
    mostRecentCompoundPrescription?.medication?.split(' ')[0];

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

  type Variation = 'Variation-1' | 'Variation-2';
  type Medication = 'semaglutide' | 'tirzepatide';
  type Duration = 30 | 60 | 90;

  const priceMap: Record<
    Variation,
    Record<Medication, Record<Duration, number>>
  > = {
    'Variation-1': {
      semaglutide: { 30: 249, 60: 599, 90: 599 },
      tirzepatide: { 30: 419, 60: 1059, 90: 1059 },
    },
    'Variation-2': {
      semaglutide: { 30: 199, 60: 454, 90: 454 },
      tirzepatide: { 30: 329, 60: 670, 90: 670 },
    },
  };

  function getPrice(
    variation: Variation,
    medication: Medication,
    duration: Duration
  ): number | undefined {
    return priceMap[variation]?.[medication]?.[duration];
  }

  const next6MonthDosage = useNextDosage(
    patientInfo!,
    medicationSelected?.toLowerCase() + '_six_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    false
  );
  const next12MonthDosage = useNextDosage(
    patientInfo!,
    medicationSelected?.toLowerCase() + '_twelve_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    false
  );

  const next3MonthDosage = useNextDosage(
    patientInfo!,
    medicationSelected?.toLowerCase() + '_multi_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    false
  );
  const next1MonthDosage = useNextDosage(
    patientInfo!,
    medicationSelected?.toLowerCase() + '_monthly',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    false
  );

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
  }, [next1MonthDosage?.med, next3MonthDosage?.med]);

  const handleClick = () => {
    const med = mostRecentCompoundPrescription?.medication?.split(' ')[0];
    /// push directly to the payment page and render the correct medication 'med' and plan 'checked'
    handleItem(item);
    if (
      item.code === 'KEEP_DOSAGE' &&
      variation9502?.variation_name === 'Variation-2'
    ) {
      let compoundMatrixRow = compoundMatrix?.find(
        entry => entry.id === mostRecentCompoundPrescription?.matrix_id.id
      );
      const medication = compoundMatrixRow?.subscription_plan
        ?.toLowerCase()
        .includes('semaglutide')
        ? 'semaglutide'
        : compoundMatrixRow?.subscription_plan
            ?.toLowerCase()
            .includes('tirzepatide')
        ? 'tirzepatide'
        : null;

      //This is for 4798 ab test
      const itemPrice =
        ['Variation-1', 'Variation-2'].includes(
          variation4798?.variation_name ?? ''
        ) &&
        medication &&
        [30, 60, 90].includes(compoundMatrixRow?.duration_in_days ?? 0)
          ? getPrice(
              variation4798?.variation_name as Variation,
              medication,
              compoundMatrixRow?.duration_in_days as Duration
            )
          : compoundMatrixRow?.price;

      // Add exact same med as most recent order
      setShouldRedirect(true);

      addMedication({
        name: compoundMatrixRow?.subscription_plan?.includes('semaglutide')
          ? 'Semaglutide weekly injections'
          : 'Tirzepatide weekly injections',
        type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
        price: itemPrice,
        dosage:
          compoundMatrixRow?.duration_in_days! < 180
            ? `${compoundMatrixRow?.vial_size?.trim()}${
                compoundMatrixRow?.shipment_breakdown?.length === 3 &&
                compoundMatrixRow?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${compoundMatrixRow?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : compoundMatrixRow?.shipment_breakdown?.length === 3 &&
                    compoundMatrixRow?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${compoundMatrixRow?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : compoundMatrixRow?.shipment_breakdown?.length === 3 &&
                    compoundMatrixRow?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${compoundMatrixRow?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : compoundMatrixRow?.number_of_vials === 2
                  ? ` (2 vials included in shipment - ${compoundMatrixRow?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : compoundMatrixRow?.number_of_vials === 1 &&
                    compoundMatrixRow?.duration_in_days === 90
                  ? ``
                  : ''
              }`
            : getShipmentText(compoundMatrixRow!),
        dose: `${compoundMatrixRow?.dose}`,
        quantity: 1,
        recurring: {
          interval: 'month',
          interval_count: compoundMatrixRow?.duration_in_days! / 30,
        },
        medication_quantity_id: 98,
        matrixId: compoundMatrixRow?.id!,
        discounted_price:
          compoundMatrixRow?.price! /
          (compoundMatrixRow?.duration_in_days! / 30),
      });
    } else {
      router.push(
        `/patient-portal/questionnaires-v2/weight-loss-compound-refill/TREATMENT_OPTIONS?code=&med=${med}&quantity=true`
      );
    }
  };

  useEffect(() => {
    if (prescriptionsLoading || compoundMatrixLoading) {
      return;
    }
    if (medications.length > 0 && shouldRedirect) {
      setShouldRedirect(false);
      const med = mostRecentCompoundPrescription?.medication?.split(' ')[0];
      const compoundMatrixRow = compoundMatrix?.find(
        entry => entry.id === mostRecentCompoundPrescription?.matrix_id.id
      );
      let checked = compoundMatrixRow?.subscription_plan?.includes('monthly')
        ? 'single'
        : compoundMatrixRow?.subscription_plan?.includes('multi_month')
        ? 'bulk'
        : compoundMatrixRow?.subscription_plan?.includes('six_month')
        ? 'six-month'
        : compoundMatrixRow?.subscription_plan?.includes('twelve_month')
        ? 'twelve-month'
        : '';

      if (
        item.code === 'KEEP_DOSAGE' &&
        variation9502?.variation_name === 'Variation-2'
      ) {
        router.push(
          `/patient-portal/questionnaires-v2/weight-loss-compound-refill/TREATMENT_OPTIONS?code=&med=${med}&review=true&checked=${checked}`
        );
      }
    }
  }, [
    medications,
    prescriptionsLoading,
    compoundMatrixLoading,
    shouldRedirect,
  ]);

  if (prescriptionsLoading || compoundMatrixLoading) {
    return <Spinner />;
  }

  return (
    <ListItemButton
      sx={
        item.color
          ? {
              backgroundColor: item.color.background,
              color: item.color.text,
              display: 'flex',
              justifyContent: 'center',
              '& .MuiTypography-root': {
                fontWeight: 'bold',
              },
              '&.Mui-selected': {
                backgroundColor: `${item.color.background}!important`,
                color: item.color.text,
              },
              '&:hover': {
                backgroundColor: item.color.background,
              },
              border: 'none',
            }
          : {}
      }
      selected={isSelected}
      key={item.text}
      onClick={handleClick}
      disabled={item.code === 'USE_TITRATION' && onHighestDosage}
    >
      <Box display="flex" flexDirection="column" sx={{ gap: '0.5rem' }}>
        <Typography>{item.text}</Typography>
        {item.subText && <Typography variant="h4">{item.subText}</Typography>}
      </Box>
      {isSelected && !item.color ? (
        <Typography>
          <CheckMark />
        </Typography>
      ) : null}
    </ListItemButton>
  );
};

export default DosageChoiceItem;
