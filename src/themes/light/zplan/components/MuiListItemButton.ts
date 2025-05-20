import { Components, Theme } from '@mui/material';
import { createBreakpoints } from '@mui/system';

const breakpoints = createBreakpoints({});

const MuiListItemButton: Components<Theme>['MuiListItemButton'] = {
  styleOverrides: {
    root: () => ({
      border: `1px solid #D8D8D8`,
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '500',
      padding: '20px 24px',
      color: '#1B1B1B',
      justifyContent: 'space-between',

      '@media(hover: hover)': {
        '&:hover': {
          backgroundColor: '#FFF9EB',
        },
      },

      '&.Mui-selected': {
        backgroundColor: '#FDF0CF !important',
        boxShadow:
          'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px',
      },

      [breakpoints.down('sm')]: {
        fontSize: '14px',
        padding: '18px 22px',
        '&:focus': {
          backgroundColor: 'inherit',
        },
      },
    }),
  },
};

export default MuiListItemButton;
