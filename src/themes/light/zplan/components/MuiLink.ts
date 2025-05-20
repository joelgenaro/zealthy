import { Components, Theme } from '@mui/material';
import { createBreakpoints } from '@mui/system';

const breakpoints = createBreakpoints({});

const MuiLink: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: 14,
      lineHeight: '16px',
      color: theme.palette.primary.light,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
        color: theme.palette.primary.main,
      },

      [breakpoints.up('sm')]: {
        fontSize: 14,
        lineHeight: '20px',
      },
      [breakpoints.up('lg')]: {
        fontSize: 16,
        lineHeight: '22px',
      },
    }),
  },
};

export default MuiLink;
