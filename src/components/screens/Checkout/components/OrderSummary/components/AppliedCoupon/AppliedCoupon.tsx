import WhiteBox from '@/components/shared/layout/WhiteBox';
import { ICoupon } from '@/types/coupon';
import Fee from '../Fee';

interface AppliedCouponProps {
  coupon: ICoupon;
}

const AppliedCoupon = ({ coupon }: AppliedCouponProps) => {
  return (
    <WhiteBox bgcolor="transparent" padding="24px">
      <Fee
        isNegative
        name={`${coupon.name} Coupon has been applied`}
        price={coupon.amount}
      ></Fee>
    </WhiteBox>
  );
};

export default AppliedCoupon;
