import { createTheme } from '@mui/material';
import MuiTypography from '@/themes/light/zplan/components/MuiTypography';
import MuiButton from '@/themes/light/zplan/components/MuiButton';
import MuiIconButton from '@/themes/light/zplan/components/MuiIconButton';
import MuiPaper from '@/themes/light/zplan/components/MuiPaper';
import MuiAvatar from '@/themes/light/zplan/components/MuiAvatar';
import MuiLink from '@/themes/light/zplan/components/MuiLink';
import MuiTextField from '@/themes/light/zplan/components/MuiTextfield';
import MuiAutocomplete from '@/themes/light/zplan/components/MuiAutocomplete';
import MuiListItemButton from '@/themes/light/zplan/components/MuiListItemButton';

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
      main: '#F5CDCD',
      dark: '#FFF9EB',
      light: '#751725',
    },
    secondary: {
      main: '#A77E7E',
      light: '#751725',
      contrastText: '#BA8600',
    },
    text: {
      primary: '#4E131C',
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
      paper: '#FFF9EB',
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
    // MuiOutlinedInput: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: '12px',
    //       background: 'transparent',
    //       backgroundImage:
    //         "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23333' stroke-width='2' stroke-dasharray='2%2c 8' stroke-dashoffset='4' stroke-linecap='square'/%3e%3c/svg%3e\")",
    //       '&:hover': {
    //         background: 'transparent',
    //         backgroundImage:
    //           "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23333' stroke-width='2' stroke-dasharray='2%2c 8' stroke-dashoffset='4' stroke-linecap='square'/%3e%3c/svg%3e\")",
    //       },
    //       '&.Mui-focused': {
    //         background: 'transparent',
    //         backgroundImage:
    //           "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23333' stroke-width='2' stroke-dasharray='2%2c 8' stroke-dashoffset='4' stroke-linecap='square'/%3e%3c/svg%3e\")",
    //       },
    //       '& .MuiOutlinedInput-notchedOutline': {
    //         border: 'none',
    //       },
    //     },
    //   },
    // },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#4E131C', // Keeps the label color consistent
          },
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
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 0,
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'transparent',
          },
          '& .MuiSvgIcon-root': {
            borderRadius: '4px',
            backgroundColor: 'transparent',
          },
          '&.Mui-checked .MuiSvgIcon-root': {
            color: '#4E131C',
          },
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
          background: 'transparent',
          borderRadius: '12px',
          backgroundImage:
            "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23333' stroke-width='2' stroke-dasharray='2%2c 8' stroke-dashoffset='4' stroke-linecap='square'/%3e%3c/svg%3e\")",
          '&:hover': {
            background: 'transparent',
            backgroundImage:
              "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23333' stroke-width='2' stroke-dasharray='2%2c 8' stroke-dashoffset='4' stroke-linecap='square'/%3e%3c/svg%3e\")",
          },
          '&.Mui-focused': {
            background: 'transparent',
            backgroundImage:
              "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23333' stroke-width='2' stroke-dasharray='2%2c 8' stroke-dashoffset='4' stroke-linecap='square'/%3e%3c/svg%3e\")",
          },
          '&::before, &::after': {
            display: 'none', // Remove default underline
          },
          input: {
            borderRadius: '12px',
            paddingTop: '20px', // Add some top padding to make room for the label
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
