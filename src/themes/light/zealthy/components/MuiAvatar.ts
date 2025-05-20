import { Components, Theme } from '@mui/material';

const MuiAvatar: Components<Theme>['MuiAvatar'] = {
  styleOverrides: {
    root: ({}) => ({
      backgroundColor: '#EBEBEB',
    }),
  },
};

export default MuiAvatar;
