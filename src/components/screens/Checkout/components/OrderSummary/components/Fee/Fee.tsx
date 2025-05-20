import { useIntakeState } from '@/components/hooks/useIntake';
import Arrow from '@/components/shared/icons/Arrow';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { Stack, Typography, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/system';
import { ReactNode, useState } from 'react';

interface FeeProps {
  name?: string;
  price: number | string;
  discountPrice?: number | string;
  isEstimated?: boolean;
  isTotal?: boolean;
  isNegative?: boolean;
  hasDetails?: boolean;
  isBranded?: boolean;
  medicareFL?: boolean;
  children?: ReactNode;
}

const StrikethroughText = styled(Typography)`
  text-decoration: line-through;
`;

interface PriceProps {
  price: number | string;
  discountPrice?: number | string;
  isEstimated?: boolean;
  fontWeight?: number;
  medicareFL?: boolean;
  variant6471?: boolean;
}

export const Price = ({
  discountPrice,
  price,
  isEstimated,
  medicareFL,
  fontWeight = 500,
  variant6471,
}: PriceProps) => {
  const theme = useTheme();
  const { potentialInsurance } = useIntakeState();

  if (typeof price === 'number' && price === 72.5) {
    price = price.toFixed(2);
  }

  return (
    <Stack direction="row" gap="0.5rem" alignItems="baseline" textAlign="end">
      {discountPrice ? (
        variant6471 ? (
          <>
            <Typography fontWeight={fontWeight}>
              {`$${price} if prescribed`}
            </Typography>
            <Typography color={theme.palette.primary.light} fontWeight={600}>
              {potentialInsurance === PotentialInsuranceOption.FIRST_MONTH_FREE
                ? 'Free'
                : `$${discountPrice} due today`}
            </Typography>
          </>
        ) : (
          <>
            <StrikethroughText fontWeight={fontWeight}>
              {`$${price}`}
            </StrikethroughText>
            <Typography color={theme.palette.primary.light} fontWeight={600}>
              {potentialInsurance === PotentialInsuranceOption.FIRST_MONTH_FREE
                ? 'Free'
                : `$${discountPrice}`}
            </Typography>
          </>
        )
      ) : (
        <Typography fontWeight={medicareFL ? 400 : 600}>
          {isEstimated && 'Estimated '}
          {medicareFL ? 'Co-Pay' : `$${price === '1188' ? '1,188' : price} `}
        </Typography>
      )}
    </Stack>
  );
};

const Fee = ({
  name,
  price,
  discountPrice,
  medicareFL = false,
  isEstimated = false,
  isTotal = false,
  isNegative = false,
  hasDetails = false,
  isBranded = false,
  children,
}: FeeProps) => {
  const [open, setOpen] = useState(true);
  const fontWeight = isTotal ? 700 : 500;
  const sign = isNegative ? '-' : '';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" gap="16px">
          {hasDetails ? (
            <IconButton onClick={() => setOpen(!open)}>
              <Arrow direction={open ? 'down' : 'up'} />
            </IconButton>
          ) : null}
          <Typography fontWeight={600}>
            {isBranded && <b>ZEALTHY </b>}
            {name}
          </Typography>
        </Box>
        <Price
          medicareFL={medicareFL}
          discountPrice={discountPrice}
          price={price}
          isEstimated={isEstimated}
          fontWeight={fontWeight}
        />
      </Box>
      {open ? children : null}
    </Box>
  );
};

export default Fee;
