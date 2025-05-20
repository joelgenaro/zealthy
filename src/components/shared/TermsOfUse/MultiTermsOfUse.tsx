import Link from 'next/link';
import { Stack, Typography, useTheme } from '@mui/material';
import { monthsFromNow } from '@/utils/monthsFromNow';
import { useAddZealthySubscription } from '@/components/hooks/useAddZealthySubscription';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useSelector } from '@/components/hooks/useSelector';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useMemo } from 'react';

const MultiTermsOfUse = ({
  hasAppointment,
  coaching,
}: {
  hasAppointment: boolean;
  coaching?: any;
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const { specificCare } = useIntakeState();
  const showZealthySubscription = useAddZealthySubscription();

  const multiText = {
    'Zealthy Weight Loss': `You will be automatically charged $39 for your first month and $135 for every month after unless you cancel your membership. You can
    cancel your membership by logging into your Zealthy account and
    clicking “Profile” in the top right corner and selecting “Manage
    Membership” in the program details section. 'Your monthly membership fees are non-refundable and you can cancel up to 36 hours before and future billing period'`,
    'Zealthy 3-Month Weight Loss': `You will be automatically charged $253 for your first three months and $339 for every 3 months after unless you cancel your membership. You can
    cancel your membership by logging into your Zealthy account and
    clicking “Profile” in the top right corner and selecting “Manage
    Membership” in the program details section. Your membership fee is fully refundable if you do not qualify for GLP-1 medications or for any reason prior to your medication prescription being sent to your local pharmacy or our partner pharmacies for shipment to your home.`,

    'Zealthy 6-Month Weight Loss': `You will be automatically charged $513 for your first six months and $599 for every six months unless you cancel your membership. You can
    cancel your membership by logging into your Zealthy account and
    clicking “Profile” in the top right corner and selecting “Manage
    Membership” in the program details section. Your membership fee is fully refundable if you do not qualify for GLP-1 medications or for any reason prior to your medication prescription being sent to your local pharmacy or our partner pharmacies for shipment to your home.`,

    'Zealthy 12-Month Weight Loss': `You will be automatically charged $934 for your first twelve months and $1020 for every twelve months unless you cancel your membership. You can
    cancel your membership by logging into your Zealthy account and
    clicking “Profile” in the top right corner and selecting “Manage
    Membership” in the program details section. Your membership fee is fully refundable if you do not qualify for GLP-1 medications or for any reason prior to your medication prescription being sent to your local pharmacy or our partner pharmacies for shipment to your home.`,
  };

  console.log(coaching, 'COACHING HERE');

  const medications = useSelector(store => store.visit.medications);
  const recurringMed = medications.find(m => !!m?.recurring?.interval);

  const isPreWorkoutTbd =
    recurringMed?.name === 'Tadalafil 10 mg + Vardenafil 10 mg';
  const renewal = useMemo(() => {
    if (recurringMed?.recurring.interval_count === 1) {
      return 'every month';
    }

    return `every ${recurringMed?.recurring?.interval_count} months`;
  }, [recurringMed?.recurring?.interval_count]);

  return (
    <Stack gap="1rem" padding={isMobile ? '0' : '0 45px'} mt="1rem">
      {hasAppointment && showZealthySubscription && (
        <Typography textAlign="center" color="#1B1B1B" variant="h4">
          If you cancel your appointment at least 24 hours in advance you won’t
          be charged a visit fee or co-pay. By clicking “Confirm payment” you
          acknowledge that we may process an authorization hold using your
          payment information.
        </Typography>
      )}
      {showZealthySubscription && (
        <Typography textAlign="center" color="#1B1B1B" variant="h4">
          {`You will be charged $30 for the Zealthy access fee every 3 
          months starting ${monthsFromNow(3)}.`}
        </Typography>
      )}
      <Typography textAlign="center" color="#1B1B1B" variant="h4">
        {specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH
          ? `If prescribed your 3 month supply of psychiatric medication, you will be charged $116.
          Every time your prescription renews (${renewal}), you will be charged $${recurringMed?.price} when your shipment goes out. You can view 
          upcoming shipment dates in the patient portal and it will be automatically updated 
          when your prescription is refilled. You can cancel your automatically renewing 
          prescription delivery by logging into your Zealthy account and clicking “Profile” 
          in the top right corner and selecting “Manage Membership” in the program details section. 
          Your prescription will renew unless you cancel at least 48 hours before the next refill is processed.`
          : specificCare === SpecificCareOption.WEIGHT_LOSS
          ? multiText[coaching?.[0]?.name as keyof typeof multiText]
          : null}
      </Typography>
      <Typography
        textAlign="center"
        color="#1B1B1B"
        variant="h4"
        padding="0 5px"
      >
        By submitting your payment information, you confirm that you have
        reviewed and agreed to Zealthy’s{' '}
        <Link
          style={{
            textDecoration: 'none',
            color: theme.palette.primary.light,
          }}
          href="https://www.getzealthy.com/terms-of-use/"
          target="_blank"
        >
          terms of use
        </Link>{' '}
        and{' '}
        <Link
          style={{
            textDecoration: 'none',
            color: theme.palette.primary.light,
          }}
          href="https://www.getzealthy.com/consent-to-telehealth"
          target="_blank"
        >
          consent to telehealth
        </Link>
        .
      </Typography>
    </Stack>
  );
};

export default MultiTermsOfUse;
