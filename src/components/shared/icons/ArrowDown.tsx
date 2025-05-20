import { SVGProps } from 'react';

const ArrowDown = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      style={{
        transform: `rotate(${'90deg'})`,
        color: '#005315',
      }}
      color="#005315"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 12H20M20 12L16 8M20 12L16 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowDown;
