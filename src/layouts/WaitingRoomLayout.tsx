import { useEstimatedTime } from '@/components/hooks/useTreatMeNow';
import Footer from '@/components/shared/layout/Footer';
import Gap from '@/components/shared/layout/Gap';
import OnboardingNav from '@/components/shared/layout/OnboardingNav';
import {
  Box,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { ReactNode } from 'react';

const StyledLink = styled(Link)`
  color: #fff;
  font-size: 0.75rem;
`;

interface WaitingRoomLayoutProps {
  children: ReactNode;
}
// in order to center text vertically and horizontally within a flexbox you must
// set the height of the parent element to 100% and the height of the child
// element to 100% as well
const WaitingRoomLayout = ({ children }: WaitingRoomLayoutProps) => {
  const { time } = useEstimatedTime();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <OnboardingNav />
      <Box
        width="100%"
        padding={isMobile ? '15px' : '32px 56px'}
        bgcolor="#6699FF"
        color="#fff"
      >
        <Grid
          container
          display="flex"
          direction="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography variant="subtitle1">
            {`Estimated wait time until visit is: ${time} min`}
          </Typography>
          <StyledLink href="#">Click here to schedule for later</StyledLink>
        </Grid>
      </Box>
      <Gap />
      {children}
      <Footer />
    </>
  );
};

export default WaitingRoomLayout;
