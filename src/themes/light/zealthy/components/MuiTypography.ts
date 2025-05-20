import { Components, Theme } from '@mui/material';
import { createBreakpoints } from '@mui/system';

const breakpoints = createBreakpoints({});

const MuiTypography: Components<Theme>['MuiTypography'] = {
  styleOverrides: {
    root: ({ ownerState, theme }) => ({
      fontSize: 14,
      lineHeight: '16px',
      [breakpoints.up('sm')]: {
        fontSize: 14,
        lineHeight: '20px',
      },
      [breakpoints.up('lg')]: {
        fontSize: 16,
        lineHeight: '22px',
      },

      ...(ownerState.variant === 'h1' && {
        fontFamily: 'Georgia, serif',
        fontWeight: 'normal',
        fontSize: 24,
        lineHeight: '44px',
        letterSpacing: '-0.025em',
        [breakpoints.up('sm')]: {
          fontSize: 44,
          lineHeight: '52px',
        },
        [breakpoints.up('lg')]: {
          fontSize: 56,
          lineHeight: '68px',
        },
      }),

      ...(ownerState.variant === 'h2' && {
        fontFamily: 'Georgia, serif',
        fontWeight: 'bold',
        fontSize: 20,
        lineHeight: '24px',
        [breakpoints.up('sm')]: {
          fontSize: 28,
          lineHeight: '34px',
        },
        [breakpoints.up('lg')]: {
          fontSize: 32,
          lineHeight: '38px',
        },
      }),

      ...(ownerState.variant === 'h3' && {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '0.0015em',
        [breakpoints.up('sm')]: {
          fontSize: 16,
          lineHeight: '20px',
        },
        [breakpoints.up('lg')]: {
          fontSize: 22,
          lineHeight: '28px',
        },
      }),

      ...(ownerState.variant === 'h4' && {
        fontWeight: 400,
        fontSize: 11,
        lineHeight: '16px',
        color: theme.palette.text.secondary,
        letterSpacing: '0.001em',
        [breakpoints.up('sm')]: {
          fontSize: 12,
          lineHeight: '16px',
        },
        [breakpoints.up('lg')]: {
          fontSize: 14,
          lineHeight: '20px',
        },
      }),
    }),
  },
};

export default MuiTypography;
