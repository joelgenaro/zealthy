import { Components, Theme } from '@mui/material';

const MuiTextField: Components<Theme>['MuiTextField'] = {
  styleOverrides: {
    root: () => ({
      '& .MuiInputBase-input': {
        paddingLeft: '24px',
        paddingRight: '24px',
        border: 0,
      },
      '& .MuiInputBase-inputMultiline': {
        paddingLeft: 0,
        paddingRight: 0,
        border: 0,
      },
    }),
  },
};

export default MuiTextField;
