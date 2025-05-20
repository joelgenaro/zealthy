import { ReactNode, useMemo } from 'react';
import NavBar from '@/components/shared/layout/NavBar';
import Footer from '@/components/shared/layout/Footer';
import Gap from '@/components/shared/layout/Gap';
import { useRouter } from 'next/router';
import { usePromoBanner } from '@/components/hooks/usePromoBanner';
import PromoBanner from '@/components/shared/PromoBanner';
import StickyHeader from '@/components/shared/StickyHeader';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface DefaultNavLayoutProps {
  children: ReactNode;
  showGap?: boolean;
  showFooter?: boolean;
}
// in order to center text vertically and horizontally within a flexbox you must
// set the height of the parent element to 100% and the height of the child
// element to 100% as well
const DefaultNavLayout = ({
  showGap = true,
  showFooter = true,
  children,
}: DefaultNavLayoutProps) => {
  const { pathname } = useRouter();
  const { text, showBanner } = usePromoBanner();
  const isMobile = useIsMobile();

  const showWeightLossBanner = useMemo(() => {
    return (
      showBanner && ['/signup', '/login'].includes('/' + pathname.split('/')[1])
    );
  }, [showBanner, pathname]);

  return (
    <>
      <StickyHeader>
        <NavBar />
        {showWeightLossBanner ? <PromoBanner text={text} /> : null}
      </StickyHeader>
      {showGap ? <Gap height={`${isMobile ? '2rem' : '3rem'}`} /> : null}
      {children}
      {showFooter ? <Footer /> : null}
    </>
  );
};

export default DefaultNavLayout;
