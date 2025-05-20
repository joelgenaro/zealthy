import { ReactNode } from 'react';
import OnboardingNav from '@/components/shared/layout/OnboardingNav';
import Footer from '@/components/shared/layout/Footer';
import Gap from '@/components/shared/layout/Gap';
import Counter from '@/components/screens/Checkout/components/Counter';
import { usePromoBanner } from '@/components/hooks/usePromoBanner';
import PromoBanner from '@/components/shared/PromoBanner';
import StickyHeader from '@/components/shared/StickyHeader';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVWOVariationName } from '@/components/hooks/data';
import { usePathname } from 'next/navigation';
import { useVisitState } from '@/components/hooks/useVisit';

interface CheckoutLayoutProps {
  children: ReactNode;
}
// in order to center text vertically and horizontally within a flexbox you must
// set the height of the parent element to 100% and the height of the child
// element to 100% as well
const CheckoutLayout = ({ children }: CheckoutLayoutProps) => {
  let { text, showBanner: defaultShowBanner } = usePromoBanner();
  const isMobile = useIsMobile();
  const { data: variant6399 } = useVWOVariationName('6399');
  const { selectedCare } = useVisitState();
  const isWeightLoss = selectedCare.careSelections.find(
    s => s.reason === 'Weight loss'
  );

  let showBanner = defaultShowBanner;
  let time;

  if (isWeightLoss) {
    showBanner = false;
    time = 15;
  }

  if (
    variant6399?.variation_name === 'Variation-1' ||
    variant6399?.variation_name === 'Variation-2'
  ) {
    text =
      'Limited Time: Enter the code ZEALTHY20 to get $20 off your first purchase';
  }

  return (
    <>
      <StickyHeader>
        <OnboardingNav />
        {showBanner ? <PromoBanner text={text} /> : <Counter time={time} />}
      </StickyHeader>
      <Gap height={`${isMobile ? '2rem' : '3rem'}`} />
      {children}
      <Footer />
    </>
  );
};

export default CheckoutLayout;
