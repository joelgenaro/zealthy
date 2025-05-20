import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import Circle from '@/components/shared/Circle';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';
import { PractitionerWithSchedule } from '@/components/hooks/useProviderSchedule';
import AvailableTimeSlots from '@/components/shared/AvailableTimeSlots';

const parseCanvasTimeSlot = (acc: SlotsByDay, slot: CanvasSlot) => {
  const day = slot.day;
  if (!acc[day]) {
    acc[day] = [];
  }
  acc[day].push(slot);
  return acc;
};

export type CanvasSlot = {
  start: string;
  end: string;
  day: string;
};

type SlotsByDay = {
  [key: string]: CanvasSlot[];
};

interface Props {
  practitioner: PractitionerWithSchedule;
  appointmentInfo: {
    id: number;
    starts_at: string | null;
    duration: number;
  };
  onSelect: (slot: CanvasSlot, practitioner: PractitionerWithSchedule) => void;
}

const ProviderSchedule = ({
  practitioner,
  appointmentInfo,
  onSelect,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [slots, setSlots] = useState<SlotsByDay | null>(null);
  const [hideCard, setHideCard] = useState<boolean>(false);
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

  useEffect(() => {
    const sortSlots = async () => {
      if (practitioner.schedule) {
        const slotsByDay = practitioner?.schedule.reduce(
          parseCanvasTimeSlot,
          {}
        );
        if (
          Object.keys(slotsByDay).length &&
          Object.keys(slotsByDay).some(key => !!slotsByDay[key].length)
        ) {
          setSlots(slotsByDay);
          setHideCard(false);
          return;
        }
        return;
      }
    };
    sortSlots();
  }, [practitioner]);

  async function handleSelectAppointment(slot: CanvasSlot) {
    if (isSlotSelected) return;
    setIsSlotSelected(true);
    onSelect(slot, practitioner);
  }

  if (hideCard) {
    return null;
  }

  return (
    <Box
      paddingY="33px"
      paddingX={{ md: '33px', xs: 0 }}
      width="100%"
      border="1px solid #989898"
      borderRadius="4px"
    >
      <Grid
        container
        direction="column"
        display="grid"
        gridTemplateColumns={isMobile ? '1fr' : '232px 1fr'}
        gap="16px"
        alignItems="center"
      >
        <Grid
          container
          direction="column"
          gap="34px"
          alignSelf="flex-start"
          alignItems="center"
        >
          <Box position="relative">
            <Circle size="200px">
              <Image
                src={
                  practitioner.clinician?.profiles?.avatar_url ||
                  ProfilePlaceholder
                }
                width="200"
                height="200"
                alt="image of a care provider"
              />
            </Circle>
          </Box>
          <Grid container direction="column" gap="0px" alignItems="center">
            <Typography
              fontSize="20px"
              lineHeight="28px"
              fontWeight="500"
              textAlign="center"
            >
              {`${
                practitioner?.clinician?.profiles?.prefix
                  ? `${practitioner?.clinician?.profiles?.prefix} `
                  : ''
              }${practitioner?.clinician?.profiles?.first_name} ${
                practitioner?.clinician?.profiles?.last_name
              }`}
            </Typography>
            {!!practitioner?.clinician?.specialties && (
              <Typography textAlign="center" color="#777777">
                {`${practitioner?.clinician?.specialties}`}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Box sx={{ height: 'auto', overflow: 'hidden' }}>
          <AvailableTimeSlots
            slots={slots || {}}
            handleSelectAppointment={handleSelectAppointment}
            isSlotSelected={isSlotSelected}
          />
        </Box>
      </Grid>
    </Box>
  );
};

export default ProviderSchedule;
