import { Order } from '@/components/screens/Checkout/types';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import { InsuranceState } from '@/context/AppContext/reducers/types/insurance';
import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { lessThan24hours } from '@/utils/date-fns';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';

interface InsuranceVisitPriceProps {
  visit: AppointmentState;
  insurance: InsuranceState;
  updateOrder: Dispatch<SetStateAction<Order>>;
}

const tooltipText =
  'We can predict your co-pay with 80% accuracy, and the co-pay listed reflects what we believe you will be responsible for. We believe in giving you transparency into what you might pay, unlike most healthcare systems that do not attempt to do this. While our system cannot be 100% accurate, it is important to us that we give you as much cost transparency as possible so that you can get the best healthcare at the lowest cost.';

const InsuranceVisitPrice = ({
  visit,
  insurance,
  updateOrder,
}: InsuranceVisitPriceProps) => {
  const theme = useTheme();
  const supabase = useSupabaseClient<Database>();
  const [price, setPrice] = useState<number>(0);
  const { potentialInsurance } = useIntakeState();

  const paymentIsRequired = useMemo(
    () =>
      visit.encounter_type === 'Walked-in' || lessThan24hours(visit.starts_at!),
    [visit.encounter_type, visit.starts_at]
  );

  const fetchPrice = async () => {
    const { data } = await supabase
      .from('encounter_duration')
      .select('price')
      .eq('duration', visit.duration)
      .single();

    if (data) {
      let price = data.price;
      if (
        potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS &&
        insurance.out_of_network
      ) {
        price = 99;
      }
      setPrice(price);
      updateOrder(order => ({
        ...order,
        visit: {
          id: visit.id,
          require_payment_now: paymentIsRequired,
          price: price,
        },
      }));
    }
  };

  useEffect(() => {
    if (!insurance.out_of_network) {
      updateOrder(order => ({
        ...order,
        visit: {
          require_payment_now: paymentIsRequired,
          price: insurance.member_obligation,
          id: visit.id,
        },
      }));
    } else {
      fetchPrice();
    }
  }, [updateOrder, visit.id, insurance]);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight="500">
          {!insurance.out_of_network
            ? `Zealthy ${visit.encounter_type} Visit Patient Responsibility`
            : 'Visit Fee'}
        </Typography>
        <Stack direction="row" alignItems="center">
          <Typography fontWeight="500">
            {!insurance.out_of_network
              ? `Estimated ${
                  insurance.co_insurance
                    ? insurance.co_insurance * 100 + '% co-insurance'
                    : '$' + insurance.member_obligation + ' co-pay'
                }`
              : `$${price}`}
          </Typography>
          {/* <Tooltip disableFocusListener title={tooltipText}>
            <IconButton>
              <AttentionIcon stroke="#6699FF" size={15} />
            </IconButton>
          </Tooltip> */}
        </Stack>
      </Box>
      <Divider
        sx={{
          margin: '16px -24px',
        }}
      />

      <Typography color={theme.palette.primary.light}>
        {!insurance.out_of_network
          ? `${
              paymentIsRequired
                ? ''
                : `No charge until after your visit with a Zealthy provider.`
            } Your ${
              insurance?.payer?.name ? insurance?.payer?.name : 'Aetna'
            } insurance is active.`
          : `Since your insurance has been accepted, we anticipate that your insurance will reimburse you for 50-70% of the cost of your visit so your total cost will likely be closer to $30-$49. ${
              paymentIsRequired
                ? ''
                : 'There will also be no charge until after your visit with a Zealthy provider.'
            }`}
      </Typography>
    </>
  );
};

export default InsuranceVisitPrice;
