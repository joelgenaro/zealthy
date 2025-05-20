import { Components, Theme } from '@mui/material';

const MuiAutocomplete: Components<Theme>['MuiAutocomplete'] = {
  styleOverrides: {
    root: theme => ({
      '& .MuiTextField-root': {
        background: 'transparent',
      },
      '& .MuiInputBase-root ': {
        paddingLeft: '24px',
        paddingRight: '24px',
      },
      '& .MuiInputBase-input.MuiAutocomplete-input': {
        paddingLeft: 0,
        paddingRight: 0,
      },
      '& input::placeholder': {
        color: '#1B1B1B',
        opacity: 1,
      },
    }),
  },
};

export default MuiAutocomplete;
