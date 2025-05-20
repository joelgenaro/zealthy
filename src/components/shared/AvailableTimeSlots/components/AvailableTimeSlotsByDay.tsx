import {
  Button,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { addDays, isSameDay } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';
import { useMemo, useState } from 'react';

export type CanvasSlot = {
  start: string;
  end: string;
  day: string;
};

interface AvailableTimeSlotsByDayProps {
  day: string;
  slots: CanvasSlot[];
  selectAppointment: (slot: CanvasSlot) => void;
  isSlotSelected: boolean;
}

const AvailableTimeSlotsByDay = ({
  day,
  slots,
  selectAppointment,
  isSlotSelected,
}: AvailableTimeSlotsByDayProps) => {
  const today = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const momentDay = utcToZonedTime(day, timezone);
  const isToday = isSameDay(momentDay, today);
  const tomorrow = addDays(today, 1);
  const isTomorrow = isSameDay(momentDay, tomorrow);

  const sortedSlots = useMemo(() => {
    return slots.map(time => ({
      ...time,
      start: new Date(utcToZonedTime(time.start, timezone)).toISOString(),
      end: new Date(utcToZonedTime(time.end, timezone)).toISOString(),
    }));
  }, [slots, timezone]);

  const [displayLimit, setDisplayLimit] = useState<number>(4);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!sortedSlots.length) {
    return null;
  }

  return (
    <Grid
      container
      alignItems="center"
      direction="column"
      gap={isMobile ? '0.5rem' : '1rem'}
      width="calc(100% - 32px)"
      minWidth="100px"
      alignSelf="flex-start"
      paddingY="2px"
    >
      <Typography
        color={theme.palette.text.secondary}
        variant="h3"
        lineHeight="28px"
        fontWeight="700"
      >
        {isToday
          ? 'Today'
          : isTomorrow
          ? 'Tomorrow'
          : format(momentDay, 'EEE, MMM d')}
      </Typography>
      <Grid
        container
        alignItems="center"
        direction="row"
        gap="8px"
        sx={{ height: 'auto', transition: 'height 0.4s linear' }}
      >
        {sortedSlots.length === 0 && (
          <Typography variant="h4" textAlign="center">
            No available appointments found
          </Typography>
        )}
        {sortedSlots.slice(0, displayLimit).map((slot, idx) => (
          <Button
            variant="outlined"
            key={`${idx}`}
            fullWidth
            onClick={() => selectAppointment(slot)}
            disabled={isSlotSelected}
          >
            <Typography fontSize={isMobile ? '14px' : '20px'}>
              {format(new Date(slot.start || ''), 'h:mm a')}
            </Typography>
          </Button>
        ))}

        {sortedSlots.length > displayLimit && (
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setDisplayLimit(displayLimit + 4)}
            disabled={isSlotSelected}
          >
            <Typography fontSize={isMobile ? '14px' : '20px'}>More</Typography>
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default AvailableTimeSlotsByDay;
