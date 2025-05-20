import { useRouter } from 'next/router';
import { useEffect } from 'react';

const WeightLossTwelveMonthEntry = () => {
  const router = useRouter();
  useEffect(() => {
    const url = '/weight-loss';
    router.push({ pathname: url, query: { variant: 'twelve-month' } });
  });
};

export default WeightLossTwelveMonthEntry;
