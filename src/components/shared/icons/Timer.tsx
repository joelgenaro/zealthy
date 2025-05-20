import { SVGProps } from 'react';

const Timer = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={17}
      height={20}
      viewBox="0 0 17 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.5 12V9M8.5 4C4.35786 4 1 7.35786 1 11.5C1 15.6421 4.35786 19 8.5 19C12.6421 19 16 15.6421 16 11.5C16 9.5561 15.2605 7.78494 14.0474 6.4525M8.5 4C10.6982 4 12.6756 4.94572 14.0474 6.4525M8.5 4V1M16 4.5L14.0474 6.4525M8.5 1H5.5M8.5 1H11.5"
        stroke={props?.stroke || '#1B1B1B'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default Timer;
