import { SVGProps } from 'react';

const Close = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="#777777"
      {...props}
    >
      <path
        d="M3.01855 3.22949L9.05571 9.6887M9.05571 3.22949L3.01855 9.6887"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Close;
