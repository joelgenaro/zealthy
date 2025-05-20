import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import {
  Combination,
  combinations,
  hairLossMedication,
} from '@/constants/hairLossMedicationMapping';
import SelectedOption from './SelectedOption';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { notEmpty } from '@/types/utils/notEmpty';
import UnselectedOption from './UnselectedOption';
import { useCallback, useMemo } from 'react';

interface MedicationOptionProps {
  medication: Combination;
}

const MedicationOption = ({ medication }: MedicationOptionProps) => {
  const { removeMedication, addMedication, updateMedication } =
    useVisitActions();
  const medicationMain = useVisitSelect(v =>
    v.medications.find(m => m.type === MedicationType.HAIR_LOSS)
  );
  const medicationAddOn = useVisitSelect(v =>
    v.medications.find(m => m.type === MedicationType.HAIR_LOSS_ADD_ON)
  );

  const canRemove = useMemo(() => {
    return [medicationMain, medicationAddOn].filter(notEmpty).length > 1;
  }, [medicationAddOn, medicationMain]);

  const removeSelected = useCallback(
    (medication: Combination) => {
      const unselectedMed = [medicationMain, medicationAddOn].find(
        m => m?.name === medication.displayName
      );
      if (unselectedMed && canRemove) {
        removeMedication(unselectedMed.type);
      }
    },
    [canRemove, medicationAddOn, medicationMain, removeMedication]
  );

  const addSelected = useCallback(
    (medication: Combination) => {
      const newMed = hairLossMedication[medication.displayName];

      if (!medicationMain) {
        addMedication({
          ...newMed,
          type: MedicationType.HAIR_LOSS,
        });

        updateMedication({
          type: MedicationType.HAIR_LOSS_ADD_ON,
          update: {
            recurring: newMed.recurring,
          },
        });
        return;
      }

      if (!medicationAddOn) {
        addMedication({
          ...newMed,
          type: MedicationType.HAIR_LOSS_ADD_ON,
        });

        updateMedication({
          type: MedicationType.HAIR_LOSS,
          update: {
            recurring: newMed.recurring,
          },
        });
        return;
      }
    },
    [addMedication, medicationAddOn, medicationMain, updateMedication]
  );

  return (
    <>
      {[medicationMain?.name, medicationAddOn?.name]
        .filter(notEmpty)
        .includes(medication.displayName) ? (
        <SelectedOption
          medication={medication}
          removeMedication={removeSelected}
        />
      ) : (
        <UnselectedOption medication={medication} addMedication={addSelected} />
      )}
    </>
  );
};

interface CustomizeYourPlanProps {
  handleTreatment: () => void;
  comboName: string;
}

const CustomizeYourPlan = ({
  handleTreatment,
  comboName,
}: CustomizeYourPlanProps) => {
  const isMobile = useIsMobile();

  const medication = useVisitSelect(v =>
    v.medications.find(m => m.type === MedicationType.HAIR_LOSS)
  );

  const medicationNames = useMemo(() => {
    if (medication?.name === 'Topical Finasteride and Minoxidil Gel') {
      return [medication?.name];
    }
    return comboName.split(' and ');
  }, [comboName, medication?.name]);

  return (
    <Stack alignItems="center" gap="40px">
      <Typography variant="h3">CUSTOMIZE YOUR PLAN</Typography>
      <Stack direction={isMobile ? 'column' : 'row'} gap="24px">
        {medicationNames.map(med => (
          <MedicationOption key={med} medication={combinations[med]} />
        ))}
      </Stack>
      <Button
        onClick={handleTreatment}
        fullWidth
        sx={{
          borderRadius: '29.5px',
          width: '279px',
        }}
      >
        Get started
      </Button>
    </Stack>
  );
};

export default CustomizeYourPlan;
