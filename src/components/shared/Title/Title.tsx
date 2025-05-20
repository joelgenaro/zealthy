import Box from '@mui/material/Box';
import { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface TitleProps {
  text: string;
  children?: ReactNode;
}

const Title = ({ text, children }: TitleProps) => {
  return (
    <Box width="100%" textAlign="left">
      <Typography variant="h2" letterSpacing="0.002em">
        {text}
      </Typography>
      {children}
    </Box>
  );
};

export default Title;
