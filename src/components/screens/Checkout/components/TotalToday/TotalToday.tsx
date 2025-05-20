import WhiteBox from '@/components/shared/layout/WhiteBox';
import { Stack, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { Price } from '../OrderSummary/components/Fee';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import AttentionTooltip from './components/AttentionTooltip';

interface TotalTodayProps {
  amount: number;
  discount: number;
  showIcon?: boolean;
  text?: string;
}

const TotalToday = ({
  amount,
  discount,
  showIcon = false,
  text = "Today's total",
}: TotalTodayProps) => {
  const { potentialInsurance } = useIntakeState();

  const StrikethroughText = styled(Typography)`
    text-decoration: line-through;
  `;
  const theme = useTheme();
  const sum = amount + discount;

  return (
    <WhiteBox padding="16px 24px">
      <Stack direction="row" justifyContent="space-between" gap={1}>
        <Stack direction="row" alignItems="center">
          {showIcon ? (
            <AttentionTooltip title="Compound GLP-1 is not included in the price of the membership." />
          ) : null}
          <Stack>
            <Typography fontWeight={600}>{text}</Typography>
            {potentialInsurance ===
              PotentialInsuranceOption.FIRST_MONTH_FREE && (
              <Typography variant="h4">
                Initial doctor consultation (one-time fee)
              </Typography>
            )}
          </Stack>
        </Stack>
        <Stack direction="row" gap={1}>
          {discount > 0 &&
            amount !== 0 &&
            potentialInsurance !==
              PotentialInsuranceOption.FIRST_MONTH_FREE && (
              <StrikethroughText fontWeight={400}>
                {'$' + sum}
              </StrikethroughText>
            )}
          <Typography
            color={discount > 0 ? theme.palette.primary.light : 'inherit'}
          >
            <Price price={amount} />
          </Typography>
        </Stack>
      </Stack>
    </WhiteBox>
  );
};

export default TotalToday;
