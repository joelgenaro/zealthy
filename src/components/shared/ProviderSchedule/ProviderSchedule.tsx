import dynamic from 'next/dynamic';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';
import { clinicianTitle } from '@/utils/clinicianTitle';
import AvailableTimeSlots, {
  CanvasSlot,
  SlotsByDay,
} from '../AvailableTimeSlots';
import CircledImage from '../CircledImage';
import { PractitionerWithSchedule } from '@/components/hooks/useProviderSchedule';
import { useEffect, useState } from 'react';

const parseCanvasTimeSlot = (acc: SlotsByDay, slot: CanvasSlot) => {
  const day = slot.day;
  if (!acc[day]) {
    acc[day] = [];
  }

  const isDuplicate = acc[day].some(
    existingSlot =>
      existingSlot.start === slot.start && existingSlot.end === slot.end
  );

  if (isDuplicate) {
    return acc;
  }

  acc[day].push(slot);
  return acc;
};

const ClinicianBioModal = dynamic(() => import('../ClinicianBioModal'), {
  ssr: false,
});

interface Props {
  index: number;
  practitioner: PractitionerWithSchedule;
  specialties: string;
  onSelect: (slot: CanvasSlot, practitioner: PractitionerWithSchedule) => void;
  hideBios?: boolean;
  setHasSlots?: (hasSlots: boolean) => void;
  isSlotSelected: boolean;
}

const ProviderSchedule = ({
  index,
  practitioner,
  onSelect,
  specialties,
  hideBios,
  setHasSlots,
  isSlotSelected,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [slots, setSlots] = useState<SlotsByDay | null>(null);
  const [hideCard, setHideCard] = useState<boolean>(true);
  const title = clinicianTitle(practitioner?.clinician);
  const [showBioModal, setShowBioModal] = useState<boolean>(false);

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
          setHasSlots && setHasSlots(true);
          setHideCard(false);
          return;
        }

        return;
      }
    };

    sortSlots();
  }, []);

  async function handleSelectAppointment(slot: CanvasSlot) {
    onSelect(slot, practitioner);
  }

  if (hideCard) {
    return null;
  }

  return (
    <Box
      id={`provider-schedule-${index}`}
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
        alignItems="flex-start"
      >
        <Grid
          container
          direction="column"
          gap="30px"
          alignSelf="flex-start"
          alignItems="center"
        >
          <CircledImage
            src={
              practitioner?.clinician.profiles?.avatar_url || ProfilePlaceholder
            }
            showBio={hideBios ? false : !!practitioner?.clinician.bio}
            openBio={() => setShowBioModal(true)}
          />
          <Grid container direction="column" gap="0px" alignItems="center">
            <Typography
              fontSize="20px"
              lineHeight="28px"
              fontWeight="500"
              textAlign="center"
            >
              {title}
            </Typography>
            {!!specialties && (
              <Typography textAlign="center" color="#777777">
                {`${specialties}`}
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
      <ClinicianBioModal
        open={showBioModal}
        setOpen={setShowBioModal}
        clinician={practitioner}
      />
    </Box>
  );
};

export default ProviderSchedule;
