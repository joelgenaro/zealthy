import React from 'react';
import { IconButton as MuiIconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface ButtonProps {
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
}

export const IconButton = (props: ButtonProps) => (
  <MuiIconButton {...props}>
    <MoreHorizIcon />
  </MuiIconButton>
);
