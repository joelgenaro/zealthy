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
          backgroundColor: '#B8F5CC',
        },
      },

      '&.Mui-selected': {
        backgroundColor: '#B8F5CC !important',
        color: '#00531B',
        borderColor: '#00531B',
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
