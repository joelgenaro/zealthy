import { useEffect, MutableRefObject } from 'react';

interface IntersectionObserverProps {
  root?: MutableRefObject<Element | null>;
  target: MutableRefObject<undefined>;
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionObserver({
  root,
  target,
  onIntersect,
  threshold = 1.0,
  rootMargin = '0px',
  enabled = true,
}: IntersectionObserverProps) {
  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    let el: any;
    if (enabled) {
      el = target.current;

      observer = new IntersectionObserver(
        entries =>
          entries.forEach(entry => entry.isIntersecting && onIntersect()),
        {
          root: root && root.current,
          rootMargin,
          threshold,
        }
      );

      if (el) observer.observe(el);
    }

    return () => {
      if (observer && el) observer.unobserve(el);
    };
  }, [target.current, enabled]);
}
