import { useEffect, useMemo, useState } from 'react';

function* countDown(from: number) {
  for (let i = from - 1; i >= 0; i--) {
    for (let j = 59; j >= 0; j--) {
      yield [i, j];
    }
  }
}

const formatNumber = (n: number) => {
  return n < 10 ? '0' + n : n.toString();
};

const useCountDown = (onEnd: (() => void) | null, countFrom: number | null) => {
  const [count, setCount] = useState(
    countFrom ? `${formatNumber(countFrom)}:00` : ''
  );

  const gen = useMemo(() => {
    if (!countFrom) {
      return null;
    }
    return countDown(countFrom);
  }, [countFrom]);

  useEffect(() => {
    if (!gen) return;
    const timeoutId = setInterval(() => {
      const { value, done } = gen.next();
      if (done) {
        clearInterval(timeoutId);
        if (typeof onEnd === 'function') {
          onEnd();
        }
      } else {
        setCount(value.map(n => formatNumber(n)).join(':'));
      }
    }, 1000);
    return () => clearInterval(timeoutId);
  }, [gen, onEnd]);

  return count;
};

export default useCountDown;
