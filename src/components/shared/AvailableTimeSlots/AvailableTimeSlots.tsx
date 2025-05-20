import { useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';
import CarouselSlider from '../CarouselSlider';
import AvailableTimeSlotsByDay, {
  CanvasSlot,
} from './components/AvailableTimeSlotsByDay';
import { notEmpty } from '@/types/utils/notEmpty';

export type SlotsByDay = {
  [key: string]: CanvasSlot[];
};

interface AvailableTimeSlotsProps {
  slots: SlotsByDay;
  handleSelectAppointment: (slot: CanvasSlot) => void;
  isSlotSelected: boolean;
}

const AvailableTimeSlots = ({
  slots,
  handleSelectAppointment,
  isSlotSelected,
}: AvailableTimeSlotsProps) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.down('lg'));

  const currentDate = new Date();
  const twoHoursFromNow = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
  const today = currentDate.toISOString().split('T')[0];

  const filteredSlotsByDay = useMemo(() => {
    const filteredSlots: SlotsByDay = {};

    Object.keys(slots).forEach(day => {
      const daySlots = slots[day];
      const validSlots = daySlots.filter(slot => {
        const slotStart = new Date(slot.start);
        if (day === today) {
          return slotStart > twoHoursFromNow;
        }
        return true;
      });

      if (validSlots.length) {
        filteredSlots[day] = validSlots;
      }
    });

    return filteredSlots;
  }, [slots, twoHoursFromNow, today]);

  const SlotsByDay = useMemo(() => {
    return Object.keys(filteredSlotsByDay || {})
      .map((day, idx) => {
        const filteredSlots = filteredSlotsByDay[day] || [];

        if (filteredSlots.length) {
          return (
            <AvailableTimeSlotsByDay
              selectAppointment={handleSelectAppointment}
              key={idx}
              day={day}
              slots={filteredSlots}
              isSlotSelected={isSlotSelected}
            />
          );
        }

        return null;
      })
      .filter(notEmpty);
  }, [handleSelectAppointment, filteredSlotsByDay, isSlotSelected]);

  return (
    <CarouselSlider
      visibleSlides={isTablet ? 2 : isLaptop ? 3 : 4}
      items={SlotsByDay}
    />
  );
};

export default AvailableTimeSlots;
