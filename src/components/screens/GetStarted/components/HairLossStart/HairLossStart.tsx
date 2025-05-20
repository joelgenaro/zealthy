import { useIsMobile } from '@/components/hooks/useIsMobile';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import BaldMan from 'public/images/bald-man.png';
import FitRxBottle from 'public/images/fitrx-bottle.png';
import ZealthyBottle from 'public/images/zealthy-bottle.png';
import GrowingHair from 'public/images/growing-hair.png';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Button from '@mui/material/Button';
import { useCallback } from 'react';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import getConfig from '../../../../../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const CheckList = () => (
  <svg
    id="CHECKLIST"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="43px"
    height="43px"
    viewBox="14.076 0.124 68.597 96.502"
    enableBackground="new 0 0 1800 1800"
    xmlSpace="preserve"
  >
    <g>
      <path d="M80.985 15.001h-8.082v-4.584c0 -0.933 -0.756 -1.689 -1.689 -1.689h-12.218C57.954 3.793 53.562 0.124 48.375 0.124c-5.187 0 -9.578 3.67 -10.621 8.605H25.536c-0.933 0 -1.689 0.756 -1.689 1.689v4.584H15.765c-0.933 0 -1.689 0.756 -1.689 1.689v78.247c0 0.933 0.756 1.689 1.689 1.689h65.219c0.933 0 1.689 -0.756 1.689 -1.689V16.69c0 -0.933 -0.756 -1.689 -1.689 -1.689zM27.225 12.106h12.001c0.893 0 1.632 -0.695 1.686 -1.587 0.238 -3.936 3.517 -7.018 7.463 -7.018 3.947 0 7.225 3.083 7.463 7.018 0.054 0.891 0.793 1.587 1.686 1.587h12.001V22.4H27.225V12.106zm52.071 81.142H17.454V18.379h6.393v5.71c0 0.933 0.756 1.689 1.689 1.689h45.678c0.933 0 1.689 -0.756 1.689 -1.689V18.379h6.393v74.87z" />
      <path d="M35.67 36.766 28.722 43.714l-3.107 -3.107c-0.66 -0.659 -1.729 -0.659 -2.388 0 -0.659 0.66 -0.659 1.729 0 2.388l4.301 4.301c0.33 0.33 0.762 0.495 1.194 0.495 0.432 0 0.864 -0.165 1.194 -0.495l8.142 -8.142c0.659 -0.66 0.659 -1.729 0 -2.389 -0.66 -0.659 -1.729 -0.659 -2.389 0z" />
      <path d="M44.344 40.343c-0.933 0 -1.689 0.756 -1.689 1.689 0 0.933 0.756 1.689 1.689 1.689h27.986c0.933 0 1.689 -0.756 1.689 -1.689s-0.756 -1.689 -1.689 -1.689H44.344z" />
      <path d="m35.67 55.896 -6.948 6.948 -3.107 -3.107c-0.66 -0.659 -1.729 -0.659 -2.388 0 -0.659 0.66 -0.659 1.729 0 2.389l4.301 4.301c0.33 0.33 0.762 0.494 1.194 0.494 0.432 0 0.864 -0.165 1.194 -0.494l8.142 -8.142c0.659 -0.66 0.659 -1.729 0 -2.389 -0.66 -0.659 -1.729 -0.659 -2.389 0z" />
      <path d="M72.329 59.473H44.344c-0.933 0 -1.689 0.756 -1.689 1.689s0.756 1.689 1.689 1.689h27.986c0.933 0 1.689 -0.756 1.689 -1.689s-0.756 -1.689 -1.689 -1.689z" />
      <path d="m35.67 75.026 -6.948 6.948 -3.107 -3.107c-0.66 -0.659 -1.729 -0.659 -2.388 0 -0.659 0.66 -0.659 1.729 0 2.389l4.301 4.301c0.33 0.33 0.762 0.494 1.194 0.494 0.432 0 0.864 -0.165 1.194 -0.494l8.142 -8.142c0.659 -0.66 0.659 -1.729 0 -2.389 -0.66 -0.659 -1.729 -0.659 -2.389 0z" />
      <path d="M72.329 78.603H44.344c-0.933 0 -1.689 0.756 -1.689 1.689s0.756 1.689 1.689 1.689h27.986c0.933 0 1.689 -0.756 1.689 -1.689s-0.756 -1.689 -1.689 -1.689z" />
    </g>
  </svg>
);

const Doctor = () => (
  <svg
    fill="#000000"
    width="43px"
    height="43px"
    viewBox="-0.134 0 1.021 1.021"
    xmlns="http://www.w3.org/2000/svg"
    className="cf-icon-svg"
  >
    <path d="M0.621 0.543v0.11a0.206 0.206 0 1 1 -0.411 0v-0.024A0.194 0.194 0 0 1 0.046 0.438V0.282a0.09 0.09 0 0 1 0.041 -0.076 0.065 0.065 0 1 1 0.026 0.056 0.031 0.031 0 0 0 -0.007 0.02v0.155a0.134 0.134 0 0 0 0.269 0V0.282a0.031 0.031 0 0 0 -0.006 -0.018 0.065 0.065 0 1 1 0.029 -0.055 0.09 0.09 0 0 1 0.037 0.073v0.155a0.194 0.194 0 0 1 -0.164 0.192v0.024a0.146 0.146 0 0 0 0.292 0V0.543a0.115 0.115 0 1 1 0.06 0zm0.026 -0.111a0.056 0.056 0 1 0 -0.056 0.056 0.056 0.056 0 0 0 0.056 -0.056z" />
  </svg>
);

const PriceTag = () => (
  <svg
    enableBackground="new 0 0 50 50"
    height="43px"
    id="Layer_1"
    viewBox="0 0 43 43"
    width="43px"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <path fill="none" height={50} width={50} d="M0 0H43V43H0V0z" />
    <path
      cx={39}
      cy={11}
      fill="none"
      r={3}
      stroke="#000000"
      strokeLinecap="round"
      strokeMiterlimit={10}
      strokeWidth={1.72}
      d="M36.12 9.46A2.58 2.58 0 0 1 33.54 12.04A2.58 2.58 0 0 1 30.96 9.46A2.58 2.58 0 0 1 36.12 9.46z"
    />
    <path
      d="M40.42 4.73A2.15 2.15 0 0 0 38.27 2.58l-12.793 0.002c-1.144 0 -2.239 -0.06 -2.873 0.574L3.056 22.702a1.625 1.625 0 0 0 0 2.3l14.942 14.942a1.627 1.627 0 0 0 2.3 0L39.844 20.397c0.635 -0.634 0.574 -1.703 0.574 -2.872L40.42 4.73z"
      fill="none"
      stroke="#000000"
      strokeLinecap="round"
      strokeMiterlimit={10}
      strokeWidth={1.72}
    />
    <g>
      <path d="M16.434 23.602c0.005 0.74 0.243 1.441 0.714 2.099l3.747 -3.747a13.649 13.649 0 0 1 -0.89 -1.696c-0.218 -0.511 -0.344 -0.986 -0.383 -1.429a2.561 2.561 0 0 1 0.213 -1.272c0.179 -0.406 0.476 -0.816 0.89 -1.232 0.424 -0.424 0.888 -0.737 1.392 -0.94s1.016 -0.304 1.534 -0.304 1.029 0.101 1.534 0.304a4.959 4.959 0 0 1 1.407 0.869l0.933 -0.933 0.777 0.778 -0.948 0.948c0.669 0.857 0.994 1.748 0.976 2.671 -0.019 0.924 -0.349 1.895 -0.99 2.913l-1.201 -1.201c0.744 -1.122 0.764 -2.196 0.057 -3.223l-3.479 3.479 0.622 1.073c0.142 0.237 0.28 0.541 0.418 0.913 0.136 0.372 0.218 0.779 0.247 1.223 0.028 0.442 -0.03 0.902 -0.176 1.379s-0.437 0.931 -0.87 1.364c-0.462 0.462 -0.949 0.795 -1.464 0.997a3.937 3.937 0 0 1 -1.569 0.283 4.321 4.321 0 0 1 -1.592 -0.36 6.132 6.132 0 0 1 -1.526 -0.961l-1.159 1.159 -0.778 -0.777 1.159 -1.16c-0.848 -1.037 -1.27 -2.114 -1.265 -3.231 0.004 -1.117 0.464 -2.208 1.379 -3.274l1.201 1.201c-0.611 0.652 -0.915 1.348 -0.911 2.087zm2.362 3.465c0.298 0.146 0.599 0.229 0.912 0.247 0.31 0.019 0.622 -0.038 0.933 -0.169 0.31 -0.132 0.617 -0.348 0.919 -0.65 0.272 -0.273 0.454 -0.55 0.544 -0.828 0.089 -0.278 0.12 -0.562 0.091 -0.855 -0.028 -0.292 -0.112 -0.596 -0.248 -0.912s-0.295 -0.638 -0.474 -0.968l-3.548 3.548c0.282 0.244 0.573 0.441 0.869 0.587zM23.822 16.723c-0.593 -0.038 -1.16 0.212 -1.697 0.749 -0.245 0.245 -0.415 0.495 -0.509 0.75 -0.095 0.254 -0.127 0.513 -0.1 0.777 0.028 0.265 0.099 0.537 0.212 0.82s0.255 0.575 0.424 0.876l3.309 -3.308c-0.501 -0.405 -1.046 -0.627 -1.64 -0.664z" />
    </g>
  </svg>
);

const HairLossStart = () => {
  const isMobile = useIsMobile();

  const onClick = useCallback(() => {
    Router.push(Pathnames.HAIR_LOSS_QUESTION_1);
  }, []);

  return (
    <Stack
      direction={isMobile ? 'column-reverse' : 'row'}
      width="100%"
      gap={isMobile ? '24px' : 0}
    >
      <Stack flexBasis={isMobile ? '100%' : '50%'}>
        <Container maxWidth="md">
          <Stack alignItems="center">
            <Stack direction="row" justifyContent="center">
              <Image
                src={BaldMan}
                alt="bald man"
                style={{
                  width: '100%',
                  height: isMobile ? '100%' : 'auto',
                }}
              />
              {siteName === 'FitRx' ? (
                <Image
                  src={FitRxBottle}
                  alt="FitRx bottle"
                  style={{
                    width: '100%',
                    height: isMobile ? '100%' : 'auto',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Image
                  src={ZealthyBottle}
                  alt="zealthy bottle"
                  style={{
                    width: '100%',
                    height: isMobile ? '100%' : undefined,
                  }}
                />
              )}
            </Stack>
            <Image
              src={GrowingHair}
              alt="growing hair"
              style={{ width: '100%', height: '100%' }}
            />
          </Stack>
        </Container>
      </Stack>
      <Stack flexBasis={isMobile ? '100%' : '50%'} justifyContent="center">
        <Container maxWidth="sm">
          <Stack gap="48px">
            <Stack gap="16px">
              <Typography variant="h2">
                {'Find a hair loss treatment plan through Zealthy.'}
              </Typography>

              <Stack direction="row" gap="16px" alignItems="center">
                <AccessTimeIcon />
                <Typography>Takes approximately 1 min</Typography>
              </Stack>
              <Typography>
                Answer a few questions to see if Zealthy is right for you and we
                will recommend a plan based on your results
              </Typography>
              <Stack direction="row" gap="16px" alignItems="center">
                <Doctor />
                <Typography textTransform="uppercase">
                  clinically proven formula
                </Typography>
              </Stack>
              <Stack direction="row" gap="16px" alignItems="center">
                <Typography>
                  <CheckList />
                </Typography>
                <Typography textTransform="uppercase">
                  guidance from hair loss experts
                </Typography>
              </Stack>
              <Stack direction="row" gap="16px" alignItems="center">
                <PriceTag />
                <Typography textTransform="uppercase">
                  affordable treatment options
                </Typography>
              </Stack>
            </Stack>
            <Button fullWidth onClick={onClick}>
              {'Get started'}
            </Button>
          </Stack>
        </Container>
      </Stack>
    </Stack>
  );
};

export default HairLossStart;
