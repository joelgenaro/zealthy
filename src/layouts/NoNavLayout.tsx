import { ReactNode } from 'react';
import Footer from '@/components/shared/layout/Footer';
import Gap from '@/components/shared/layout/Gap';
import StickyHeader from '@/components/shared/StickyHeader';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Grid, useTheme } from '@mui/material';
import ZealthyLogo from '@/components/shared/icons/ZealthyLogo';
import Logo from '@/components/shared/icons/Logo';

interface NoNavLayoutProps {
  children: ReactNode;
}

const NoNavLayout = ({ children }: NoNavLayoutProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  return (
    <>
      <StickyHeader>
        <Grid
          container
          px={isMobile ? 2 : 6.5}
          height={isMobile ? 60 : 108}
          bgcolor={
            !isMobile
              ? theme.palette.background.paper
              : theme.palette.background.default
          }
          borderBottom={!isMobile ? '1px solid #777777' : 'none'}
          justifyContent={'center'}
          alignItems="center"
        >
          <Logo />
        </Grid>
      </StickyHeader>
      <Gap height={`${isMobile ? '2rem' : '3rem'}`} />
      {children}
      <Footer />
    </>
  );
};

export default NoNavLayout;
