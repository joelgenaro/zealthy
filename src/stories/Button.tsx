import React from 'react';
import { Button as MuiButton } from '@mui/material';

interface ButtonProps {
  variant?: 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'grey';
  size?: 'large' | 'medium';
  label?: string;
  disabled?: boolean;
}

export const Button = ({ label, ...rest }: ButtonProps) => (
  <MuiButton {...rest}>{label}</MuiButton>
);
