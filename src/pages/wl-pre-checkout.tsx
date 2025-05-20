import Head from 'next/head';
import WeightLossPreCheckout from '@/components/screens/Checkout/components/WeightLossPreCheckout';
import StickyHeader from '@/components/shared/StickyHeader';
import Counter from '@/components/screens/Checkout/components/Counter';
import OnboardingNav from '@/components/shared/layout/OnboardingNav';
import Footer from '@/components/shared/layout/Footer';

const WLPreCheckout = () => (
  <>
    <Head>
      <title>{"You're approved! | Zealthy"}</title>
    </Head>
    <OnboardingNav />
    <StickyHeader marginBottom={5}>
      <Counter time={15} text="Your approval expires in" />
    </StickyHeader>
    <WeightLossPreCheckout />
    <Footer />
  </>
);

export default WLPreCheckout;
