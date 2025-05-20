import { Stack } from '@mui/material';
import { ReactNode } from 'react';

interface StickyHeaderProps {
  children: ReactNode;
  marginBottom?: number;
}

const StickyHeader = ({ children, marginBottom }: StickyHeaderProps) => {
  return (
    <Stack position="sticky" top="0" zIndex={11} mb={marginBottom || 0}>
      {children}
    </Stack>
  );
};

export default StickyHeader;
