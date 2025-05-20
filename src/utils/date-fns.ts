import { differenceInDays, differenceInHours } from 'date-fns';

export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatTime = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date));
};

export const addTime = (date: string, duration: number) => {
  return new Date(new Date(date).getTime() + duration * 60000).toISOString();
};

/**
 * @description we will need to refactor this function(remove moment)
 */
export const lessThan24hours = (date: string) => {
  if (!date) return true;
  const days = differenceInDays(new Date(date || ''), new Date());
  const hours = differenceInHours(new Date(date || ''), new Date());
  return days < 1 && hours <= 24;
};

/**
 * Returns UNIX timestamp
 * @param {number} numberOfMonths
 * @returns {number} unix timestamp
 */
export const monthsFromNow = (numberOfMonths: number = 1): number => {
  const now = new Date();
  const nMonthsFromNow = new Date(
    now.setMonth(now.getMonth() + numberOfMonths)
  );

  return Math.floor(nMonthsFromNow.getTime() / 1000);
};

/**
 * Returns UNIX timestamp
 * @param {number} numberOfDays
 * @returns {number} unix timestamp
 */
export const daysFromNow = (numberOfDays: number = 1): number => {
  const now = new Date();
  const nDaysFromNow = new Date(now.setDate(now.getDate() + numberOfDays));

  return Math.floor(nDaysFromNow.getTime() / 1000);
};

/**
 * @param {number} numberOfHours
 * @returns Returns a date as a string value in ISO format.
 */
export const hoursFromNow = (numberOfHours: number = 1): string => {
  const now = new Date();
  return new Date(now.setHours(now.getHours() + numberOfHours)).toISOString();
};

export function dateDiffInDays(a: Date, b: Date) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
