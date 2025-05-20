import WhiteBox from '@/components/shared/layout/WhiteBox';
import CustomText from '@/components/shared/Text';
import { ISubscription } from '@/types/subscription';
import { monthsFromNow } from '@/utils/monthsFromNow';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Fee from '../Fee';
import WhatsIncluded from './components/WhatsIncluded';

interface ZealthyFeeProps {
  subscription: ISubscription;
}

const StyledList = styled('ul')`
  margin: 0;
  padding-left: 1.5rem;
`;

const ZealthyFee = ({ subscription }: ZealthyFeeProps) => {
  const { price, discountedPrice, monthFrequency } = subscription;
  return (
    <WhiteBox bgcolor="transparent" gap="24px">
      <Box>
        <Fee
          name="access fee"
          isBranded
          price={`${price}`}
          discountPrice={`${discountedPrice}`}
        />
        <StyledList>
          <li>
            <CustomText fontSize="14px">{`First ${monthFrequency} months free!`}</CustomText>
          </li>
          <li>
            <CustomText fontSize="14px">{`$${price} every ${monthFrequency} months`}</CustomText>
          </li>
          <li>
            <CustomText fontSize="14px">{`Next charge on ${monthsFromNow(
              3
            )}`}</CustomText>
          </li>
        </StyledList>
      </Box>
      <WhatsIncluded />
    </WhiteBox>
  );
};

export default ZealthyFee;
