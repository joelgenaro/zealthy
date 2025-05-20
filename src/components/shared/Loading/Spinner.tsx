import { Box, BoxProps, styled } from '@mui/material';

export type SpinnerProps = BoxProps & {
  size?: string | number;
  color?: string;
};

const Spinner = styled(Box)<SpinnerProps>`
  font-size: ${({ size }) => size || '56px'};
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 0.1em solid transparent;
  color: ${({ color, theme }) => color || theme.palette.primary.main};
  background: conic-gradient(
      from 180deg at 50% 50%,
      currentColor 0deg,
      transparent 320deg
    )
    border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  animation: spin 1.5s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`;

export default Spinner;
