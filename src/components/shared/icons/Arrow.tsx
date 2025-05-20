import { CSSProperties } from 'react';

interface ArrowProps {
  direction?: 'up' | 'down';
  style?: CSSProperties;
}

const Arrow = ({ direction = 'up', style }: ArrowProps) => {
  return (
    <svg
      style={{
        transform: `rotate(${direction === 'up' ? '180deg' : '0deg'})`,
        color: '#1B1B1B',
        ...style,
      }}
      width={14}
      height={8}
      viewBox="0 0 14 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L7 7L13 1"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Arrow;
