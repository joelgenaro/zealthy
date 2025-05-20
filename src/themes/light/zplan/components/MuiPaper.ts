import { Components, Theme } from '@mui/material';

const MuiPaper: Components<Theme>['MuiPaper'] = {
  variants: [
    {
      props: { variant: 'panel' },
      style: {
        padding: 32,
        borderRadius: 24,
        boxShadow: '0 12px 24px 4px rgba(0, 0, 0, 0.04)',
      },
    },
  ],
};

export default MuiPaper;
