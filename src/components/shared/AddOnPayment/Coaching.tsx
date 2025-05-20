import {
  Box,
  Button,
  Container,
  Link,
  List,
  ListItem,
  Stack,
  Typography,
} from '@mui/material';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { Database } from '@/lib/database.types';
import {
  CoachingState,
  CoachingType,
} from '@/context/AppContext/reducers/types/coaching';
import { Price } from '@/components/screens/Checkout/components/OrderSummary/components/Fee';
import ErrorMessage from '../ErrorMessage';
import { monthsFromNow } from '@/utils/monthsFromNow';
import getConfig from '../../../../config';

type PaymentProfile = Database['public']['Tables']['payment_profile']['Row'];

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const parseName = (type: CoachingType) => {
  const map: { [key in CoachingType]: string } = {
    WEIGHT_LOSS: `the ${siteName} weight loss program`,
    MENTAL_HEALTH: '1:1 mental health coaching',
    PERSONALIZED_PSYCHIATRY: 'Personalized Psychiatry',
  };
  return map[type] || 'program';
};

const mapTypeToText: {
  [key in CoachingType]: {
    title: string;
    items: string[];
    optOut?: string;
    buttonText?: string;
    skip?: string;
    fee?: string;
  };
} = {
  MENTAL_HEALTH: {
    title: 'Our mental health program includes:',
    items: [
      'Matching you to a coach who will work to ensure that appropriately prescribed medication supplemented by proper emotional support',
      '45 minute monthly 1:1 coaching sessions by phone or video',
      "Unlimited messaging with your coach to track your progress and check in on how you're doing",
      'Tracking your mental health progress and goals',
    ],
  },
  WEIGHT_LOSS: {
    title: 'Our weight loss program includes:',
    items: [
      'Provider review of request for GLP-1s or similar medications and prescription if medically appropriate',
      'Assistance with getting your medications covered by insurance (which can cost over $1,000/month without insurance)',
      'Unlimited messaging with a coach who can help you build customized plan',
      'Tracking your weight loss progress and goals',
    ],
  },
  PERSONALIZED_PSYCHIATRY: {
    title: 'Our Personalized Psychiatry program includes:',
    items: [
      `Initial video or phone visit, including diagnosis if appropriate, with ${siteName} mental health provider`,
      'Rx sent to your home or preferred pharmacy, if prescribed',
      `Follow-up video or phone visits with your ${siteName} mental health provider`,
      'Unlimited messaging with coordinator and mental health provider',
    ],
    optOut: `You can opt out at any time. After your first month, you will be charged $99/month starting on ${monthsFromNow()}.`,
    buttonText: 'Add Personalized Psychiatry',
    skip: 'Continue without psychiatry',
    fee: 'Personalized Psychiatry',
  },
};

interface CoachingProps {
  plan: CoachingState | null;
  patientPayment?: PaymentProfile;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  hasSubscription?: boolean;
  onNext: () => void;
}

export function CoachingAddOn({
  plan,
  patientPayment,
  onBack,
  onSubmit,
  loading,
  hasSubscription = false,
  onNext,
}: CoachingProps) {
  if (!plan) {
    return <ErrorMessage>No coaching plan was selected</ErrorMessage>;
  }

  const { title, items, optOut, buttonText, skip, fee } =
    mapTypeToText[plan.type];

  return (
    <Container sx={{ padding: '12px', maxWidth: '500px' }}>
      <Typography
        variant="h2"
        sx={{
          marginBottom: '16px',
          fontSize: '32px !important',
          lineHeight: '38px !important',
        }}
      >
        {`You have added ${
          parseName(plan.type) || 'a coaching plan'
        } to your cart.`}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginBottom: '30px',
        }}
      >
        <Typography
          sx={{
            fontSize: '16px !important',
            fontWeight: '600',
            lineHeight: '22px',
            letterSpacing: '0.005em',
            marginBottom: '8px',
          }}
        >
          {title}
        </Typography>
        <List
          sx={{
            listStyleType: 'disc',
            pl: 3,
            marginBottom: '8px',
            fontSize: '16px',
          }}
          disablePadding
        >
          {items.map(text => (
            <ListItem key={text} sx={{ display: 'list-item', padding: 0 }}>
              {text}
            </ListItem>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '24px',
          background: '#FFFFFF',
          border: '1px solid #D8D8D8',
          borderRadius: '16px',
          marginBottom: '16px',
        }}
      >
        <Box sx={{ marginBottom: '16px' }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: '16px !important',
              fontWeight: '600',
              lineHeight: '24px !important',
              color: '#989898',
            }}
          >
            {'Payment'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
            {patientPayment?.last4
              ? `**** **** **** ${patientPayment?.last4}`
              : 'No payment information!'}
          </Typography>
          <Link
            onClick={() => null}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Edit'}
          </Link>
        </Box>

        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: '16px !important',
              fontWeight: '600',
              lineHeight: '24px !important',
              color: '#989898',
            }}
          >
            {fee || 'Coaching fee'}
          </Typography>
          {plan?.discounted_price ? (
            <Price
              price={`${plan.price}/month`}
              discountPrice={`${plan.discounted_price} for the first month`}
              fontWeight={300}
            />
          ) : (
            <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
              {`$${plan?.price}.00`}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            lineHeight: '22px !important',
            fontWeight: '400',
            fontStyle: 'italic',
            marginBottom: '48px',
            textAlign: 'start',
          }}
        >
          {optOut || `You can opt out at any time.`}
        </Typography>
        <Stack direction="column" gap="30px" alignItems="center">
          {hasSubscription ? (
            <>
              <Typography color="green" textAlign="center">
                Good news! You have already subscribed. Please click <b>Next</b>{' '}
                button to continue
              </Typography>
              <Button onClick={onNext} fullWidth>
                Next
              </Button>
            </>
          ) : (
            <>
              <LoadingButton
                sx={{ width: '100%' }}
                loading={loading}
                disabled={hasSubscription || loading}
                onClick={onSubmit}
              >
                {buttonText ||
                  `Add 1:1 Coaching - $${
                    plan?.discounted_price || plan?.price
                  }.00`}
              </LoadingButton>
            </>
          )}
        </Stack>
      </Box>
    </Container>
  );
}
