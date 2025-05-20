import { useMemo } from 'react';
import { useSelector } from './useSelector';

export const useTotalDiscount = () => {
  const coaching = useSelector(store => store.coaching);
  const medications = useSelector(store => store.visit.medications);

  const discount = useMemo(() => {
    let discount = coaching.reduce((acc, c) => {
      return (acc += c.price - (c?.discounted_price || c.price));
    }, 0);

    discount = medications.reduce((acc, m) => {
      const price = m.price || 0;
      return (acc += price - (m?.discounted_price || price));
    }, discount);
    return discount;
  }, [coaching, medications]);

  return discount;
};
