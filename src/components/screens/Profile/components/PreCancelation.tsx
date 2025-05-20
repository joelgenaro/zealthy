import { PatientSubscriptionProps } from '@/components/hooks/data';
import { ED_MAPPING } from '@/constants/ed-mapping';
import { MedicationName } from '@/constants/ed-mapping/types';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Router from 'next/router';
import { useMemo } from 'react';
import { OptionType } from './MembershipManage/types';
import PrescriptionOptionCard from './PrescriptionOptionCard';

interface PreCancelationProps {
  subscription: PatientSubscriptionProps | undefined;
}

type Prices = {
  currentPrice: number;
  basePrice: number;
  interval: number;
};

const savings = ({ currentPrice, basePrice, interval }: Prices) => {
  const percent = Math.round((currentPrice / (basePrice * interval)) * 100);
  return 100 - percent;
};

const PreCancelation = ({ subscription }: PreCancelationProps) => {
  const { id } = Router.query;

  const planName = useMemo(() => {
    return subscription?.care === 'Erectile dysfunction' ? 'Zealthy ED' : '';
  }, [subscription?.care]);
  const isHardie = subscription?.order?.prescription.medication
    ?.toLowerCase()
    ?.includes('hardies');
  const selections = useMemo(() => {
    const medication = subscription?.order?.prescription.medication || '';
    const [name, ...rest] = medication?.split(' ');
    const [dosage, unit] = rest.slice(-2);
    const interval = Math.floor(Number(subscription?.interval_count) / 30);
    const dispense =
      (subscription?.order?.prescription.dispense_quantity! / interval) * 3;

    if (name && dosage && unit && dispense) {
      const key = isHardie
        ? subscription?.order?.prescription.medication
        : name === 'Sildenafil'
        ? 'Sildenafil (Generic Viagra)'
        : name === 'Tadalafil'
        ? 'Tadalafil (Generic Cialis)'
        : name;

      const currentOptions =
        ED_MAPPING[key as MedicationName][
          `${dosage} ${unit.toLowerCase()}`
        ]?.quantities?.find(q => q.value === dispense)?.otherOptions || [];
      const basePrice = currentOptions?.[0]?.price;

      return (
        currentOptions
          .filter(o => o.quantity > (dispense || 1))
          .map(
            o =>
              ({
                popular: o.recurring.interval_count === 3,
                header: `Zealthy ED ${o.recurring.interval_count}-Month Plan`,
                type: 'ed',
                subHeader: `Save ${savings({
                  currentPrice: o?.price,
                  basePrice,
                  interval: o.recurring.interval_count,
                })}%`,
                body: `$${o?.price} billed every ${o?.recurring?.interval_count} months`,
                path: `/manage-prescriptions/cancel/${id}?page=confirm-upgrade&name=${name}&dosage=${dosage}&unit=${unit?.toLowerCase()}&base=${dispense}&quantity=${
                  o?.quantity
                }`,
                interval: o?.recurring?.interval_count,
              } as OptionType)
          ) || []
      );
    }

    return [];
  }, [
    id,
    subscription?.interval,
    subscription?.interval_count,
    subscription?.order?.prescription.dispense_quantity,
    subscription?.order?.prescription.medication,
  ]);

  return (
    <Stack
      gap="25px"
      sx={{
        borderRadius: '16px',
      }}
    >
      <Stack gap="1rem">
        <Typography variant="h2">{'Manage Your Plan'}</Typography>
        <Stack gap="16px">
          <Typography fontWeight="600">Save when you pre-pay!</Typography>
          <Typography variant="subtitle1">
            {`Commit to a long-term change and save when you purchase up to
                one year of ${planName} plan today. Your upgrade will start after
                your current billing period.`}
          </Typography>
        </Stack>
      </Stack>
      <Stack gap="16px" width="100%">
        {selections.map((medicationOption, idx) => (
          <PrescriptionOptionCard option={medicationOption} key={idx} />
        ))}
      </Stack>

      <Link
        onClick={() => {
          Router.push(
            {
              pathname: `/manage-prescriptions/cancel/${id}`,
              query: { page: 'cancelation' },
            },
            undefined,
            { shallow: true }
          );
        }}
        style={{
          alignSelf: 'center',
          color: '#777',
          cursor: 'pointer',
        }}
      >
        {`Cancel ${planName} plan`}
      </Link>
    </Stack>
  );
};

export default PreCancelation;
