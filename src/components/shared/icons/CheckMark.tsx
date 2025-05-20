import { SVGProps } from 'react';

const CheckMark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={18}
      height={14}
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1 7.611 5.923 12.5 17 1.5"
        stroke={props?.stroke || '#1B1B1B'}
        strokeWidth={props.strokeWidth || 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CheckMark;
