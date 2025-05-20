import { BoxProps } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactNode } from 'react';

interface WhiteBoxProps {
  compact?: boolean;
  children: ReactNode;
  programs?: boolean;
}

const WhiteBox = ({
  compact,
  children,
  programs,
  ...rest
}: WhiteBoxProps & BoxProps) => {
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection={programs ? 'row' : 'column'}
      borderRadius="0.75rem"
      padding={compact ? '2rem' : '3.5rem 2rem'}
      gap={compact ? '1rem' : '2rem'}
      bgcolor="white"
      border="1px solid #D8D8D8"
      boxShadow="0px 12px 24px 4px rgba(0, 0, 0, 0.04)"
      {...rest}
    >
      {children}
    </Box>
  );
};

export default WhiteBox;
