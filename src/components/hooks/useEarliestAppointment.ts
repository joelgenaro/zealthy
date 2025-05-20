import { format, utcToZonedTime } from 'date-fns-tz';
import { useEffect, useMemo, useState } from 'react';
import { usePatient } from './data';
import { useProviderSchedule } from './useProviderSchedule';
import { isAfter, addHours, parseISO } from 'date-fns';

export const useEarliestAppointment = () => {
  const { data: patient } = usePatient();
  const { practitioners } = useProviderSchedule({
    type: 'Provider',
    duration: 30,
  });

  const [ellipsis, setEllipsis] = useState('');

  const earliestAppointment = useMemo(() => {
    if (!practitioners?.length) {
      return null;
    }
    const currentTime = new Date();
    const twoHoursLater = addHours(currentTime, 2);
    for (const practitioner of practitioners) {
      if (Array.isArray(practitioner.schedule)) {
        const validAppointment = practitioner.schedule.find(slot =>
          isAfter(parseISO(slot.start), twoHoursLater)
        );
        if (validAppointment) {
          return validAppointment.start;
        }
      }
    }
    return null;
  }, [practitioners]);

  useEffect(() => {
    if (earliestAppointment) return;
    const interval = setInterval(() => {
      setEllipsis(prev => {
        if (prev === '...') {
          return '';
        }
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, [earliestAppointment]);

  return {
    earliestAppointment: earliestAppointment
      ? format(
          utcToZonedTime(earliestAppointment, patient?.timezone || ''),
          `MMMM d 'at' h:mm a zz`
        )
      : null,
    ellipsis,
  };
};
