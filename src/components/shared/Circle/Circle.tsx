import Box from '@mui/material/Box';
import { ReactNode } from 'react';

interface CircleProps {
  size: string;
  bgColor?: string;
  children: ReactNode;
}

const Circle = ({ size, bgColor, children }: CircleProps) => {
  return (
    <Box
      width={size}
      height={size}
      bgcolor={bgColor || '#EBEBEB'}
      borderRadius="50%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {children}
    </Box>
  );
};

export default Circle;
