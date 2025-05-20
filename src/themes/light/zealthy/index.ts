import { createTheme } from '@mui/material';
import MuiTypography from '@/themes/light/zealthy/components/MuiTypography';
import MuiButton from '@/themes/light/zealthy/components/MuiButton';
import MuiIconButton from '@/themes/light/zealthy/components/MuiIconButton';
import MuiPaper from '@/themes/light/zealthy/components/MuiPaper';
import MuiAvatar from '@/themes/light/zealthy/components/MuiAvatar';
import MuiLink from '@/themes/light/zealthy/components/MuiLink';
import MuiTextField from '@/themes/light/zealthy/components/MuiTextfield';
import MuiAutocomplete from '@/themes/light/zealthy/components/MuiAutocomplete';
import MuiListItemButton from '@/themes/light/zealthy/components/MuiListItemButton';

const lightTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 520,
      md: 768,
      lg: 1240,
      xl: 1536,
    },
  },

  palette: {
    mode: 'light',
    primary: {
      main: '#00531B',
      dark: '#00210B',
      light: '#027C2A',
    },
    secondary: {
      main: '#8ACDA0',
      light: '#EBEBEB',
      contrastText: '#00531B',
    },
    text: {
      primary: '#1B1B1B',
      secondary: '#535353',
      disabled: '#A8A8A8',
    },
    error: {
      main: '#CC7456',
      light: '#EAB6A4',
    },
    success: {
      main: '#70A2EB',
      light: '#B7CEEE',
    },
    background: {
      // default: "#FFFFFF",
      paper: '#FFF',
    },
  },

  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: 16,
          lineHeight: '22px',
          letterSpacing: '0.005em',
          '*::-webkit-scrollbar': {
            width: '5px',
          },
          '*::-webkit-scrollbar-track': {
            WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: ' rgba(255, 255, 255, 0.9);',
            outline: '1px solid slategrey',
            borderRadius: '100px',
          },
        },
        '#__next': {
          height: '100%',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: 0,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          input: {
            borderRadius: '12px',
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          background: '#EBEBEB',
          borderRadius: '12px',
          input: {
            borderRadius: '12px',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '12px',
          lineHeight: '16px',
          letterSpacing: '0.004em',
          color: '#777777',
          top: '4px !important',
        },
      },
    },
    MuiTypography,
    MuiLink,
    MuiButton,
    MuiListItemButton,
    MuiIconButton,
    MuiPaper,
    MuiAvatar,
    MuiTextField,
    MuiAutocomplete,
  },
});

export default lightTheme;
