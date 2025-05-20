import { Components, Theme } from '@mui/material';
import { createBreakpoints } from '@mui/system';

const breakpoints = createBreakpoints({});

const MuiButton: Components<Theme>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
    variant: 'contained',
    size: 'large',
  },

  styleOverrides: {
    root: ({ ownerState, theme }) => ({
      fontWeight: 900,
      fontSize: 16,
      textTransform: 'initial',
      padding: '0 24px',
      gap: 8,
      borderRadius: 8,

      ...(ownerState.size === 'large' && {
        height: 56,
        [breakpoints.down('md')]: {
          height: 52,
        },
      }),

      ...(ownerState.size === 'medium' && {
        height: 50,
      }),

      ...(ownerState.size === 'small' && {
        height: 44,
        fontSize: 14,
      }),

      ...(ownerState.variant === 'contained' && {
        ...(ownerState.color === 'primary' && {
          '&:hover': {
            backgroundColor: '#C36875',
          },
        }),

        ...(ownerState.color === 'secondary' && {
          backgroundColor: '#91e6ac',
          color: 'yellow',

          '&:hover': {
            backgroundColor: '#84C297',
          },
        }),

        ...(ownerState.color === 'grey' && {
          backgroundColor: '#F0F0F0',
          color: '#535353',
          '&:hover': {
            backgroundColor: '#DDDDDD',
          },
        }),

        '&.Mui-disabled': {
          backgroundColor: '#F4F4F4',
          color: '#A8A8A8',
        },
      }),

      // ...(ownerState.variant === 'outlined' && {
      //   borderColor: theme.palette.primary.main,

      //   ...(ownerState.color === 'primary' && {
      //     '&:hover': {
      //       backgroundColor: '#89DBA3',
      //     },
      //   }),

      //   ...(ownerState.color === 'grey' && {
      //     color: '#535353',
      //     '&:hover': {
      //       backgroundColor: '#DDDDDD',
      //     },
      //   }),

      //   '&.Mui-disabled': {
      //     backgroundColor: '#FFF',
      //     borderColor: '#CCCCCC',
      //     color: '#ACACAC',
      //   },
      // }),
      ...(ownerState.variant === 'rounded' && {
        borderRadius: '16px',
        backgroundColor: theme.palette.primary.main,
        color: '#FFF',
        padding: '10px 16px',
        lineHeight: '1rem',
        height: 'inherit',
        minWidth: '90px',

        // ...(ownerState.color === 'primary' && {
        //   '&:hover': {
        //     backgroundColor: '#89DBA3',
        //   },
        // }),

        // ...(ownerState.color === 'grey' && {
        //   color: 'black',
        //   backgroundColor: '#E8EAEC',
        //   '&:hover': {
        //     backgroundColor: '#DDDDDD',
        //   },
        // }),

        // '&.Mui-disabled': {
        //   backgroundColor: '#FFF',
        //   borderColor: '#CCCCCC',
        //   color: '#ACACAC',
        // },
      }),
    }),
  },
};

export default MuiButton;
