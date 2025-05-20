import { SVGProps } from 'react';

const ArrowRight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      color="#1B1B1B"
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

export default ArrowRight;
