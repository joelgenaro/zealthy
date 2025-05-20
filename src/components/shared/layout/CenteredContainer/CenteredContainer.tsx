import { Breakpoint } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { ReactNode } from 'react';

interface CenteredContainerProps {
  children: ReactNode;
  maxWidth?: Breakpoint;
  gap?: string;
  sx?: object;
}

const CenteredContainer = ({
  children,
  maxWidth = 'xs',
  gap = '48px',
  sx,
}: CenteredContainerProps) => {
  return (
    <Container maxWidth={maxWidth} {...sx}>
      <Grid container direction="column" gap={gap}>
        {children}
      </Grid>
    </Container>
  );
};

export default CenteredContainer;
