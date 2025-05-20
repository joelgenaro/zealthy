export const phoneDigitsOnly = (phoneNumber: string) => {
  return phoneNumber?.replace(/^\+1/, '') ?? '';
};
