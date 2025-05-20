import WhiteBox from '@/components/shared/layout/WhiteBox';
import Fee from '../Fee';

interface TotalTodayProps {
  totalAmount: number;
}

const TotalToday = ({ totalAmount }: TotalTodayProps) => {
  return (
    <WhiteBox
      compact
      bgcolor="transparent"
      border="3px solid #1B1B1B"
      borderRadius="1rem"
    >
      <Fee isTotal name="Total due today" price={totalAmount} />
    </WhiteBox>
  );
};

export default TotalToday;
