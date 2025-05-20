import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useCreateWeightLossReferral } from '@/components/hooks/mutations';
import {
  usePatient,
  usePatientWeightLossReferrals,
} from '@/components/hooks/data';
import { handleCopy } from '@/utils/copyToClipboard';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Database } from '@/lib/database.types';
import GiftPhoneIcon from 'public/icons/gift-phone.svg';
import GiftCoinIcon from 'public/icons/gift-coin.svg';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

type PatientReferralRedeem =
  Database['public']['Tables']['patient_referral_redeem']['Row'];

const AccountabilityPartner = () => {
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const { isLoading, data: patientReferrals } = usePatientWeightLossReferrals();
  const createReferralCode = useCreateWeightLossReferral();

  const [email, setEmail] = useState('');

  const referralLink = useMemo(
    () =>
      patientReferrals?.referral?.code
        ? `${window.location.origin}/signup/${patientReferrals?.referral?.code}`
        : 'Loading...',
    [patientReferrals?.referral]
  );

  const subject =
    'Save $10 on Zealthy’s Weight Loss Program including GLP-1 Medication';

  const body = `Join me on Zealthy. Zealthy’s weight loss program can help you obtain GLP-1 medications affordably - as low as $0/month with insurance or $130/month without - if you qualify.  Use my link to save $10 on top of any other discounts they're offering: ${referralLink}`;

  const redeemed = useMemo(() => {
    return patientReferrals?.redemptions?.filter(
      (redemption: PatientReferralRedeem) => redemption.redeemed
    ).length;
  }, [patientReferrals?.redemptions]);

  function handleShare() {
    window.freshpaint?.track('clicked-referral-invite-friends', {
      email: patient?.profiles?.email,
      first_name: patient?.profiles?.first_name,
      last_name: patient?.profiles?.last_name,
      state: patient?.region,
      platform: window.navigator?.userAgent,
    });

    navigator
      .share({
        title:
          'Save $10 on Zealthy’s Weight Loss Program including GLP-1 Medication',
        text: `${patient?.profiles?.first_name} sent you $10 off at Zealthy, a healthcare company helping people easily get affordable access to medical care including GLP-1 weight loss medications and more.`,
        url: referralLink,
      })
      .catch(error => console.log('Sharing failed', error));
  }

  async function handleCreateReferralCode() {
    await createReferralCode.mutateAsync({
      patientId: patient?.id,
    });
  }

  useEffect(() => {
    if (!isLoading && !patientReferrals?.referral?.code && patient?.id) {
      handleCreateReferralCode();
    }
  }, [patientReferrals, patient?.id]);

  useEffect(() => {
    if (!patient) return;
    window.freshpaint?.track('viewed-referral-landing', {
      email: patient?.profiles?.email,
      first_name: patient?.profiles?.first_name,
      last_name: patient?.profiles?.last_name,
      state: patient?.region,
      platform: window.navigator?.userAgent,
    });
  }, [patient]);

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h2"
        textAlign={isMobile ? 'center' : 'left'}
        sx={{ marginBottom: '3rem' }}
      >
        Earn up to $50 when you share Zealthy!
      </Typography>
      <Box
        sx={
          isMobile
            ? {
                textAlign: 'center',
                marginBottom: '3rem',
                background: '#FFFFFF',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid #D8D8D8',
              }
            : { textAlign: 'center', marginBottom: '3rem' }
        }
      >
        <Stack
          gap={4}
          direction={isMobile ? 'column' : 'row'}
          justifyContent="space-around"
        >
          <Stack direction="column" gap={1}>
            <Typography fontWeight={600} sx={{ fontSize: '2rem !important' }}>
              {patientReferrals?.redemptions?.length ?? 0}
            </Typography>
            <Typography fontWeight={400} sx={{ fontSize: '1rem !important' }}>
              {'signed up'}
            </Typography>
          </Stack>
          {!!patientReferrals?.redemptions?.length && (
            <Stack direction="column" gap={1}>
              <Typography fontWeight={600} sx={{ fontSize: '2rem !important' }}>
                {redeemed ?? 0}
              </Typography>
              <Typography fontWeight={400} sx={{ fontSize: '1rem !important' }}>
                {'active'}
              </Typography>
            </Stack>
          )}
          {!!redeemed && (
            <Stack direction="column" gap={1}>
              <Typography fontWeight={600} sx={{ fontSize: '2rem !important' }}>
                {`$${redeemed * 10}`}
              </Typography>
              <Typography fontWeight={400} sx={{ fontSize: '1rem !important' }}>
                {'saved'}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
      <Stack direction="column" gap={2} mb={4}>
        {!!navigator?.share && (
          <>
            <Button fullWidth onClick={handleShare}>
              Share your invite link
            </Button>
            <Divider>or</Divider>
          </>
        )}
        <Box
          sx={{
            background: '#FFFFFF',
            borderRadius: '1rem',
            border: '1px solid #D8D8D8',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <TextField
            sx={{
              '.MuiInputBase-input': {
                textAlign: 'left',
                paddingLeft: 0,
              },
            }}
            fullWidth
            placeholder="Friend’s email address"
            variant="standard"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button
            size="small"
            sx={{ minWidth: '125px' }}
            onClick={() => {
              window.freshpaint?.track('clicked-referral-email-sent', {
                email: patient?.profiles?.email,
                email_entered: DOMPurify.sanitize(email, {
                  USE_PROFILES: { html: false },
                }),
                first_name: patient?.profiles?.first_name,
                last_name: patient?.profiles?.last_name,
                state: patient?.region,
                platform: window.navigator?.userAgent,
                referral_url: referralLink,
              });
              toast.success('Referral email sent!');
              setEmail('');
            }}
          >
            Send invite
          </Button>
        </Box>
        <Divider>or</Divider>
        <Box
          sx={{
            borderRadius: '1rem',
            border: '1px solid #D8D8D8',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Stack
            direction="row"
            gap={2}
            width="100%"
            justifyContent="space-between"
          >
            <Typography sx={{ lineBreak: 'anywhere', alignSelf: 'center' }}>
              {referralLink}
            </Typography>
            <Button
              size="small"
              sx={{ minWidth: '115px' }}
              onClick={() => handleCopy(referralLink)}
            >
              Copy link
            </Button>
          </Stack>
        </Box>
      </Stack>

      <Stack direction="column" gap={4} justifyContent="center">
        <Stack direction="row" gap={2} alignItems="center">
          <Image
            src={GiftPhoneIcon}
            alt="gift phone icon"
            height={isMobile ? '64' : '100'}
            width={isMobile ? '64' : '100'}
          />
          <Typography sx={{ marginBottom: '1rem' }}>
            <b>{'You get $10'}</b>
            <br />
            {'towards your subscription for every friend* who signs up'}
          </Typography>
        </Stack>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography sx={{ marginBottom: '1rem' }}>
            <b>{'Your Friend Gets $10'}</b>
            <br />
            {'towards their subscription when they sign up with your link'}
          </Typography>
          <Image
            src={GiftCoinIcon}
            alt="gift phone icon"
            height={isMobile ? '64' : '100'}
            width={isMobile ? '64' : '100'}
          />
        </Stack>
        <Typography variant="h4" textAlign="center">
          *Limit 5 friends per month
          <br />
          <br />
          Friends must click on your referral link and make a purchase for
          bonuses to apply. They will see $10 bonus applied in addition to other
          discounts. Applicable on Zealthy Weight Loss Programs only.
        </Typography>
      </Stack>
    </Container>
  );
};

export default AccountabilityPartner;
