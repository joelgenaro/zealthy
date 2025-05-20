import { getKeys } from '@/utils/getKeys';
import { useMemo } from 'react';
import { Order } from '../screens/Checkout/types';

export const useCanRemove = (order: Order) => {
  const canRemove = useMemo(() => {
    const numberOfItemsSelected = getKeys(order)
      .filter(key => key !== 'subscriptions')
      .reduce((acc, key) => {
        const item = order[key];
        if (Array.isArray(item)) {
          acc += item.length;
        } else {
          acc += Number(!!item);
        }
        return acc;
      }, 0);

    return numberOfItemsSelected > 1;
  }, [order]);

  return canRemove;
};
