import Box from '@mui/material/Box';
import InsuranceBox from './components/InsuranceBox';
import TotalFees from './components/TotalToday';
import VisitFee from './components/VisitFee';
import SubHeading from '@/components/shared/SubHeading';
import { Visit } from '@/types/visit';
import { zealthySubscription } from '@/__mocks__/data/subscription';
import ZealthyFee from './components/ZealthyFee';
import { useInsuranceState } from '@/components/hooks/useInsurance';

interface OrderSummary {
  visit: Visit;
  hasInsurance: boolean;
  openInsuranceModal: (open: boolean) => void;
  totalAmount: number;
}

const OrderSummary = ({ visit, hasInsurance, totalAmount }: OrderSummary) => {
  const insurance = useInsuranceState();
  //const distinctProducts = uniqBy(products, "type");
  // const zealthySubscription = subscriptions.find(
  //   (subscription) => subscription.type === SubscriptionType.ZEALTHY_ACCESS
  // );

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <SubHeading>Now, let’s take care of your payment details</SubHeading>
      {!hasInsurance && <InsuranceBox insurance={insurance} />}
      {zealthySubscription ? (
        <ZealthyFee subscription={zealthySubscription} />
      ) : null}
      {visit !== Visit.NONE && visit !== Visit.ASYNC && (
        <VisitFee visit={visit} hasInsurance={hasInsurance} />
      )}
      {/*coupon ? <AppliedCoupon coupon={coupon} /> : null*/}
      {/*prescriptions?.map((prescription) => (
        <MedicationsFee key={prescription.id} prescription={prescription} />
      ))*/}
      {/*delivery ? <DeliveryFee delivery={delivery} /> : null*/}
      <TotalFees totalAmount={totalAmount} />
    </Box>
  );
};

export default OrderSummary;
