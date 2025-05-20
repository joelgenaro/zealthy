import { SVGProps } from 'react';

const EmptyCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={8} cy={8} r={7.5} stroke="#1B1B1B" />
  </svg>
);
export default EmptyCircle;
