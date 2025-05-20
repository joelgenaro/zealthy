import { Components, Theme } from '@mui/material';

const MuiIconButton: Components<Theme>['MuiIconButton'] = {
  styleOverrides: {
    root: ({ ownerState }) => ({
      color: '#000',

      '&:hover': {
        backgroundColor: '#F0F1F1',
      },

      ...(ownerState.size === 'small' && {
        width: 32,
        height: 32,
      }),
    }),
  },
};

export default MuiIconButton;
