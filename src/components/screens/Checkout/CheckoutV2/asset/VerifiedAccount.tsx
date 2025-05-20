import React from 'react';
import getConfig from '../../../../../../config';

const VerifiedAccount = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_8113_2737"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="25"
      >
        <rect y="0.41748" width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_8113_2737)">
        <path
          d="M12 23.4175L4.8 18.0175C4.55 17.8341 4.35417 17.6008 4.2125 17.3175C4.07083 17.0341 4 16.7341 4 16.4175V4.41748C4 3.86748 4.19583 3.39665 4.5875 3.00498C4.97917 2.61331 5.45 2.41748 6 2.41748H18C18.55 2.41748 19.0208 2.61331 19.4125 3.00498C19.8042 3.39665 20 3.86748 20 4.41748V16.4175C20 16.7341 19.9292 17.0341 19.7875 17.3175C19.6458 17.6008 19.45 17.8341 19.2 18.0175L12 23.4175ZM10.95 15.4175L16.6 9.76748L15.2 8.31748L10.95 12.5675L8.85 10.4675L7.4 11.8675L10.95 15.4175Z"
          fill={
            ['Zealthy', 'FitRx'].includes(siteName ?? '')
              ? '#008A2E'
              : '#B2882C'
          }
        />
      </g>
    </svg>
  );
};

export default VerifiedAccount;
