import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useState } from 'react';
import { mapStrengthToHardies } from './hardies-options';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@/components/shared/icons/CloseIcon';

interface ModalProps {
  open: boolean;
  onClose: (m: boolean) => void;
  medName: string;
  setFrequency: (f: string) => void;
  usage: string;
}

type StrengthOption = {
  name: string;
  dosage: string;
};

const EditModal = ({
  open,
  onClose,
  medName,
  setFrequency,
  usage,
}: ModalProps) => {
  const isMobile = useIsMobile();
  const { addMedication } = useVisitActions();
  const [selectedStrength, setSelectedStrength] = useState<StrengthOption>();
  const [selectedFrequency, setSelectedFrequency] = useState<Medication | null>(
    null
  );
  const supabase = useSupabaseClient<Database>();

  const sildenafilTadalafilStrengths: StrengthOption[] = [
    { name: 'Sildenafil 55 mg | Tadalafil 22 mg', dosage: '77 mg' },
    { name: 'Sildenafil 45 mg | Tadalafil 15 mg', dosage: '60 mg' },
  ];

  const tadalafilVardenafilStrengths: StrengthOption[] = [
    { name: 'Tadalafil 8.5 mg | Vardenafil 8.5 mg', dosage: '17 mg' },
    { name: 'Tadalafil 5 mg | Vardenafil 5 mg', dosage: '10 mg' },
  ];
  const strengthOptions: StrengthOption[] = medName
    ?.toLowerCase()
    ?.includes('sildenafil')
    ? sildenafilTadalafilStrengths
    : tadalafilVardenafilStrengths;

  const handleOnChangeStrength = (e: any) => {
    const selectedOption = strengthOptions.find(
      option => option.name === e.target.value
    );
    setSelectedStrength(selectedOption);
  };

  const handleOnChangeFrequency = (e: any) => {
    setSelectedFrequency(e.target.value);
  };

  const onConfirm = async () => {
    addMedication({
      ...selectedFrequency!,
      type: MedicationType.ED,
      name: `${selectedStrength?.name} Hardies` || '',
      dosage: 'Standard',
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      price: selectedFrequency?.price,
      quantity: selectedFrequency?.value,
      note: `Preferred ED medication: ${selectedStrength?.name}. 
      Preferred ED medication frequency: every 3 month(s). 
      Preferred ED medication quantity: ${selectedFrequency?.value}
      Preferred ED medication dosage: ${selectedStrength?.dosage}.
      Preferred ED medication usage: ${usage}.`,
    });
    setFrequency('Every 3 months');
    onClose(!open);
  };

  const selectedHardies = mapStrengthToHardies([selectedStrength?.name!]);

  const desktopSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 300,
    minHeight: 300,
    maxHeight: '100%',
    overflow: 'auto',
    p: 4,
    outline: 'none',
    borderRadius: 2,
  };

  const mobileSx = {
    position: 'absolute',
    bgcolor: 'background.default',
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    p: 4,
  };

  return (
    <Modal open={open}>
      <Box sx={isMobile ? mobileSx : desktopSx}>
        <Stack gap={2}>
          <IconButton
            sx={{
              color: '#FFFFFF',
              padding: '0',
              position: 'relative',
              bottom: `${isMobile ? '110px' : '0'}`,
              alignSelf: 'end',
            }}
            edge="start"
            onClick={() => onClose(!open)}
          >
            <CloseIcon />
          </IconButton>
          <Typography fontSize="1.3rem!important" fontWeight={700}>
            Edit Treatment Preference
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="strength-selection">Strength</InputLabel>
            <Select
              required
              fullWidth
              value={selectedStrength?.name || ''}
              onChange={handleOnChangeStrength}
              label="Strength"
            >
              {strengthOptions?.map((med: StrengthOption, idx: number) => (
                <MenuItem key={idx} value={med.name}>
                  {med.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="uses-selection">Uses</InputLabel>
            <Select
              required
              fullWidth
              label="Uses"
              //   value={selectedDosage || ''}
              onChange={handleOnChangeFrequency}
            >
              {selectedHardies?.[0]?.Standard?.quantities?.map(
                (hardie: any, idx: number) => (
                  <MenuItem key={idx} value={hardie}>
                    {hardie.display_name}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
          <Button disabled={!selectedFrequency} onClick={onConfirm}>
            Confrim
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default EditModal;
