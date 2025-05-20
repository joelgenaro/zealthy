import Box from '@mui/material/Box';
import { ReactNode } from 'react';
import Circle from '@/components/shared/Circle';

interface DottedBoxProps {
  onClick?: () => void;
  children: ReactNode;
}

const DottedBox = ({ onClick, children }: DottedBoxProps) => {
  return (
    <Box
      overflow="hidden"
      borderRadius="24px"
      maxWidth="464px"
      width="100%"
      height="260px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      margin="auto"
      border="1px dashed #1B1B1B"
      sx={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <Circle size="72px">{children}</Circle>
    </Box>
  );
};

export default DottedBox;
