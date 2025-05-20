import WhiteBox from '@/components/shared/layout/WhiteBox';
import { Visit } from '@/types/visit';
import { Typography } from '@mui/material';
import Fee from '../Fee';

interface VisitFeeProps {
  visit: Visit;
  hasInsurance: boolean;
}

const VisitFee = ({ visit, hasInsurance }: VisitFeeProps) => {
  const paymentDescription =
    visit === Visit.ILV
      ? 'You will be charged right after your visit'
      : 'You will be charged 12 hours before your visit';
  return (
    <WhiteBox bgcolor="transparent" padding="24px" gap="2px">
      <Fee
        name={`${visit} Visit${hasInsurance ? ' Co-pay' : ''}`}
        isEstimated={hasInsurance}
        price={0}
      />
      <Typography variant="caption">{paymentDescription}</Typography>
    </WhiteBox>
  );
};

export default VisitFee;
