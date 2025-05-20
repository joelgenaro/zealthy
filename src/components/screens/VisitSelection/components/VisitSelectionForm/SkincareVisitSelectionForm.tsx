import { List, Typography, styled } from '@mui/material';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import Option from '@/components/screens/Question/components/ImageChoice/Option';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import {
  useActivePatientSubscription,
  usePatientPrescriptionRequest,
} from '@/components/hooks/data';
import { isWeightLossMed } from '@/utils/isWeightLossMed';

export type ProductType = Pick<
  Database['public']['Tables']['reason_for_visit']['Row'],
  'id' | 'reason'
>;

const StyledForm = styled('form')`
  width: 100%;
`;

function getImage(reason: string) {
  switch (reason) {
    case 'Acne': {
      return '/images/skincare/acne-icon.png';
    }
    case 'Fine Lines & Wrinkles': {
      return '/images/skincare/fine-lines-icon.png';
    }
    case 'Hyperpigmentation Dark Spots': {
      return '/images/skincare/hyperpigmentation-icon.png';
    }
    case 'Rosacea': {
      return '/images/skincare/rosacea-icon.png';
    }
    default: {
      return '/images/skincare/acne-icon.png';
    }
  }
}

interface VisitOptionsProps {
  selections: ReasonForVisit[];
  onContinue: () => void;
}

const SkincareVisitSelectionForm = ({
  selections,
  onContinue,
}: VisitOptionsProps) => {
  const { addCare } = useVisitActions();
  const { addSpecificCare } = useIntakeActions();
  const {
    selectedCare: { careSelections },
  } = useVisitState();
  const [error, setError] = useState('');

  const [hasPendingRosaceaRequest, setHasPendingRosaceaRequest] =
    useState<boolean>(false);
  const [hasPendingMelasmaRequest, setHasPendingMelasmaRequest] =
    useState<boolean>(false);
  const [hasPendingAcneRequest, setHasPendingAcneRequest] =
    useState<boolean>(false);
  const [hasPendingAntiAgingRequest, setHasPendingAntiAgingRequest] =
    useState<boolean>(false);

  const { data: requests } = usePatientPrescriptionRequest();
  const updateData = useCallback(() => {
    if (Array.isArray(requests)) {
      let hasWeightLossRequest = false;
      requests
        ?.filter(r => r.status !== 'PRE_INTAKES')
        .forEach(request => {
          const medication =
            request?.medication_quantity?.medication_dosage?.medication;

          if (medication?.display_name?.toLowerCase().includes('rosacea')) {
            setHasPendingRosaceaRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('acne')) {
            setHasPendingAcneRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('melasma')) {
            setHasPendingMelasmaRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('anti-aging')) {
            setHasPendingAntiAgingRequest(true);
          }
        });
    }
  }, [requests]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  const { data: subscriptions } = useActivePatientSubscription();

  const acneSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('acne')
    );
  }, [subscriptions]);

  const rosaceaSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('rosacea')
    );
  }, [subscriptions]);

  const melasmaSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('melasma')
    );
  }, [subscriptions]);

  const antiAgingSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('anti-aging')
    );
  }, [subscriptions]);

  const selectItem = useCallback(
    (item: ReasonForVisit) => {
      setError('');

      const selectedCare = [item];

      addCare({
        care: {
          careSelections: selectedCare,
          other: '',
        },
      });
    },
    [addCare]
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!careSelections.length) {
      setError('Please select at least one');
      return;
    }
    switch (careSelections[0].reason) {
      case 'Acne':
        addSpecificCare(SpecificCareOption.ACNE);
        break;
      case 'Fine Lines & Wrinkles':
        addSpecificCare(SpecificCareOption.ANTI_AGING);
        break;
      case 'Hyperpigmentation Dark Spots':
        addSpecificCare(SpecificCareOption.MELASMA);
        break;
      case 'Rosacea':
        addSpecificCare(SpecificCareOption.ROSACEA);
        break;
      default:
        addSpecificCare(SpecificCareOption.DEFAULT);
        break;
    }

    onContinue();
  };

  return (
    <StyledForm onSubmit={onSubmit}>
      <List
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '48px',
          padding: '0',
        }}
      >
        {selections.map(selection => {
          const isSelected = !!careSelections.find(c => c.id === selection.id);

          if (
            (selection.reason === 'Acne' &&
              (acneSubscription || hasPendingAcneRequest)) ||
            (selection.reason === 'Fine Lines & Wrinkles' &&
              (antiAgingSubscription || hasPendingAntiAgingRequest)) ||
            (selection.reason === 'Hyperpigmentation Dark Spots' &&
              (melasmaSubscription || hasPendingMelasmaRequest)) ||
            (selection.reason === 'Rosacea' &&
              (rosaceaSubscription || hasPendingRosaceaRequest))
          ) {
            return null;
          }

          return (
            <Option
              compact={true}
              key={selection.reason}
              isSelected={isSelected}
              onSelect={() => selectItem(selection)}
              option={{
                text: selection.reason,
                image: getImage(selection.reason),
              }}
            />
          );
        })}
      </List>
      {error ? (
        <Typography color="red" textAlign="center">
          {error}
        </Typography>
      ) : null}
      <LoadingButton
        type="submit"
        disabled={!careSelections.length}
        sx={{ width: '100%' }}
      >
        Continue
      </LoadingButton>
    </StyledForm>
  );
};

export default SkincareVisitSelectionForm;
