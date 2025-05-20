import React from 'react';
import { Box, Divider, Typography as MuiTypography } from '@mui/material';

interface ButtonProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4';
  label?: string;
}

export const Typography = ({ label, ...rest }: ButtonProps) => (
  <Box display="flex" flexDirection="column">
    <MuiTypography {...rest}>{label}</MuiTypography>
    <Divider sx={{ my: 2 }} />
    <MuiTypography variant="h1">h1. Display1</MuiTypography>
    <MuiTypography variant="h2">h2. Heading1</MuiTypography>
    <MuiTypography variant="h3">h3. Title1</MuiTypography>
    <MuiTypography variant="h4">h4. Label1</MuiTypography>
  </Box>
);
