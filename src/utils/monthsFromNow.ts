export const monthsFromNow = (numberOfMonths: number = 1) => {
  const now = new Date();
  const inThreeMonths = new Date(
    now.setMonth(now.getMonth() + numberOfMonths)
  ).toISOString();

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(inThreeMonths));
};

export const oneMonthFromNow = () => {
  const now = new Date();
  const inThreeMonths = new Date(
    now.setMonth(now.getMonth() + 1)
  ).toISOString();

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(inThreeMonths));
};
