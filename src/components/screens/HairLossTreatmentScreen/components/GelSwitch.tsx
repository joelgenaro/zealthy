import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import { hairLossMedication } from '@/constants/hairLossMedicationMapping';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useMemo, useState } from 'react';

const GelSwitch = () => {
  const isMobile = useIsMobile();
  const { removeMedication, addMedication } = useVisitActions();
  const medication = useVisitSelect(v =>
    v.medications.find(m => m.type === MedicationType.HAIR_LOSS)
  );
  const [currentChoice, setCurrentChoice] = useState(
    medication?.name.includes('Gel') ? 1 : 0
  );

  const handleCurrentChoice = useCallback(
    (current: number) => {
      removeMedication(MedicationType.HAIR_LOSS);
      removeMedication(MedicationType.HAIR_LOSS_ADD_ON);

      if (current === 1) {
        addMedication(
          hairLossMedication['Topical Finasteride and Minoxidil Gel']
        );
      } else {
        addMedication({
          ...hairLossMedication['Oral Finasteride'],
          type: MedicationType.HAIR_LOSS,
        });
        addMedication({
          ...hairLossMedication['Minoxidil Foam'],
          type: MedicationType.HAIR_LOSS_ADD_ON,
        });
      }

      setCurrentChoice(current);
    },
    [addMedication, removeMedication]
  );

  const leftBorder = useMemo(() => {
    if (currentChoice === 0) {
      return {
        borderRadius: '12px',
        border: '1px solid #000',
        color: '#1b1b1b',
        background: '#FFF',
      };
    } else {
      return {
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
      };
    }
  }, [currentChoice]);

  const rightBorder = useMemo(() => {
    if (currentChoice === 1) {
      return {
        borderRadius: '12px',
        border: '1px solid #000',
        color: '#1b1b1b',
        background: '#FFF',
      };
    } else {
      return {
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px',
      };
    }
  }, [currentChoice]);

  return (
    <Stack
      sx={{
        cursor: 'pointer',
      }}
      gap="16px"
      onClick={() => handleCurrentChoice(currentChoice === 0 ? 1 : 0)}
    >
      <Typography fontWeight="600">
        Select your finasteride and minoxidil type:
      </Typography>
      <Stack
        width={isMobile ? '100%' : '220px'}
        direction="row"
        bgcolor="#EBEBEB"
        color="#777"
        position="relative"
        borderRadius="12px"
        justifyContent="center"
      >
        <Stack width="55%" padding="10px 14px" sx={leftBorder}>
          <Typography
            fontWeight={currentChoice === 0 ? 700 : 'inherit'}
            sx={{
              fontSize: '16px !important',
            }}
          >
            Pill + foam
          </Typography>
        </Stack>
        <Stack width="45%" padding="10px 14px" sx={rightBorder}>
          <Typography
            fontWeight={currentChoice === 0 ? 'inherit' : 700}
            sx={{
              fontSize: '16px !important',
            }}
          >
            Gel
          </Typography>
        </Stack>
        <Typography
          fontWeight={700}
          bgcolor="#FA4141"
          color="white"
          borderRadius="12px"
          border="1px solid #FA4141"
          padding="0 5px"
          position="absolute"
          top={0}
          right={0}
          zIndex={2}
        >
          New
        </Typography>
      </Stack>
    </Stack>
  );
};

export default GelSwitch;
