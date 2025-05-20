import { format, parseISO, setHours, setMinutes, setSeconds } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export default function setTimeToTimezone(
  date: Date,
  timezone: string,
  hour: number,
  minute: number,
  second: number
) {
  const now = new Date();

  // Convert the current date and time to the specified time zone
  const zonedDate = utcToZonedTime(now, timezone);

  // Set the time to 9 AM
  const dateWith9AM = setSeconds(
    setMinutes(setHours(zonedDate, hour), minute),
    second
  );

  // Convert back to UTC if necessary
  const utcDateWith9AM = zonedTimeToUtc(dateWith9AM, timezone);

  return utcDateWith9AM;
}
