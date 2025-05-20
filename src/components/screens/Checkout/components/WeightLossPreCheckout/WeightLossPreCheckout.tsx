import Router from 'next/router';
import {
  Box,
  Button,
  Container,
  Divider,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { usePatient } from '@/components/hooks/data';
import WLGraph from 'public/images/wl-graph-pre-checkout.svg';
import OzempicImage from 'public/images/ozempic.png';
import ZealthyGLP1Image from 'public/images/ZealthyGLP1.png';
import TrophyIcon from 'public/icons/trophy.svg';
import RxIcon from 'public/icons/rx.svg';
import ShieldIcon from 'public/icons/shield.svg';
import ScaleIcon from 'public/icons/scale.svg';
import StethoscopeIcon from 'public/icons/stethoscope.svg';
import Institutions from 'public/images/institutions-horizontal.png';
import TrendDown from 'public/icons/trend-down.png';
import GreenCheckShield from 'public/icons/green-check-shield.png';
import Image from 'next/image';
import { usePatientState } from '@/components/hooks/usePatient';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Database } from '@/lib/database.types';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Pathnames } from '@/types/pathnames';
import { useSelector } from '@/components/hooks/useSelector';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

const WeightLossPreCheckout = () => {
  const supabase = useSupabaseClient<Database>();
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const { weight, goal_weight } = usePatientState();
  const coaching = useSelector(store => store.coaching);
  const { addCoaching, removeCoaching } = useCoachingActions();

  const [subscriptionSingle, setSubscriptionSingle] =
    useState<Subscription | null>(null);
  const [subscriptionBulk, setSubscriptionBulk] = useState<Subscription | null>(
    null
  );

  const [checked, setChecked] = useState<string>('bulk');
  const [error, setError] = useState<string>('');

  const name = 'Zealthy Weight Loss';

  const goalEnd = useMemo(() => {
    if (!weight || !goal_weight) return '';
    const lossPercentage = 1 - (weight - goal_weight) / weight;
    console.log('lossPercentage', lossPercentage);
    if (lossPercentage < 0.85) {
      return '12 months';
    } else if (lossPercentage < 0.9) {
      return '9 months';
    } else if (lossPercentage < 0.95) {
      return '3 months';
    } else {
      return '1 month';
    }
  }, [weight, goal_weight]);

  useEffect(() => {
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', name)
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscriptionSingle(data);
      });
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', 'Zealthy 3-Month Weight Loss')
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscriptionBulk(data);
      });

    if (subscriptionBulk && !coaching) {
      addCoaching({
        type: CoachingType.WEIGHT_LOSS,
        name: 'Zealthy 3-Month Weight Loss Plan',
        id: subscriptionBulk!.id,
        planId: subscriptionBulk!.reference_id,
        recurring: {
          interval: 'month',
          interval_count: 3,
        },
        price: subscriptionBulk!.price,
        discounted_price: 264,
      });
    }
  }, [subscriptionBulk, supabase]);

  const handleContinue = useCallback(async () => {
    if (!checked.length)
      return setError('Please select an option above to continue.');
    removeCoaching(CoachingType.WEIGHT_LOSS);
    if (checked === 'bulk') {
      addCoaching({
        type: CoachingType.WEIGHT_LOSS,
        name: 'Zealthy 3-Month Weight Loss Plan',
        id: subscriptionBulk!.id,
        planId: subscriptionBulk!.reference_id,
        recurring: {
          interval: 'month',
          interval_count: 3,
        },
        price: subscriptionBulk!.price,
        discounted_price: 264,
      });
    } else {
      addCoaching({
        type: CoachingType.WEIGHT_LOSS,
        name: 'Zealthy Weight Loss Program',
        id: subscriptionSingle!.id,
        planId: subscriptionSingle!.reference_id,
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
        price: subscriptionSingle!.price,
        discounted_price: 39,
      });
    }
    Router.push(Pathnames.CHECKOUT);
  }, [checked, subscriptionBulk, subscriptionSingle]);

  const handleChange = (value: string) => {
    setChecked(value);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h2">{`${patient?.profiles.first_name}’s prescription plan has been approved!`}</Typography>
      <Stack gap="30px" mt={3}>
        <Typography>
          Zealthy’s personalized weight loss plan includes{' '}
          <b>prescribed medication</b>, support to get{' '}
          <b>GLP-1 medications covered by insurance</b>, professional{' '}
          <b>weight loss guidance</b> with a coach, access to{' '}
          <b>semaglutide or tirzepatide</b> shipped to your home, and 24/7{' '}
          <b>medical provider messaging</b>.
        </Typography>
        <Box position="relative">
          <Box
            bgcolor="#B8F5CC"
            width="fit-content"
            borderRadius={10}
            padding="1px 12px"
            sx={{
              position: 'absolute',
              fontWeight: 'bold',
              fontSize: '15px',
              top: '0',
              left: '-10px',
            }}
          >
            {weight} lbs.
          </Box>
          <Box
            bgcolor="#B8F5CC"
            width="fit-content"
            borderRadius={10}
            padding="5px 15px"
            textAlign="center"
            sx={{
              position: 'absolute',
              fontWeight: 'bold',
              fontSize: '15px',
              bottom: '80px',
              right: '-10px',
              lineHeight: '1',
            }}
          >
            {goal_weight} lbs.
            <Typography fontSize="11px !important" fontWeight="bold">
              Goal Weight
            </Typography>
          </Box>
          <Image
            src={WLGraph}
            alt="Weight Loss Graph"
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            position="absolute"
            width="100%"
            bottom="5px"
          >
            <Typography>Today</Typography>
            <Typography>{goalEnd}</Typography>
          </Stack>
        </Box>
        <Box
          bgcolor="#fff"
          border="1px solid lightgrey"
          borderRadius={4}
          display="grid"
          gridTemplateColumns={isMobile ? '240px 1fr' : '260px 1fr'}
          height="100px"
        >
          <Stack
            direction="row"
            height="inherit"
            alignItems="center"
            position="relative"
          >
            <Image
              src={OzempicImage}
              alt="Weight Loss Graph"
              sizes="100vh"
              style={{
                width: 'auto',
                height: '100%',
              }}
            />
            <Typography position="relative" left="-25px">
              You have a very high chance of meeting your weight loss goals with
              GLP-1 medication.
            </Typography>
          </Stack>
          <Stack
            direction="column"
            alignSelf="center"
            justifySelf="flex-end"
            textAlign="center"
            marginRight="15px"
            gap={0.5}
          >
            <Typography
              fontWeight="bold"
              fontSize="33px !important"
              color="primary"
            >
              93.6%
            </Typography>
            <Typography>very high</Typography>
          </Stack>
        </Box>
        <Divider />
        <Stack>
          <Typography fontFamily="Georgia, serif" fontSize="17px !important">
            With your personalized plan, you’ll accomplish:
          </Typography>
          <Stack direction="row" gap={0} alignItems="center" marginLeft={1}>
            <Image src={TrophyIcon} alt="Trophy Icon" width="41" height="41" />
            <ul>
              <li>
                <Typography>
                  Lose {(weight ?? 0) - (goal_weight ?? 0)} pounds
                </Typography>
              </li>
              <li>
                <Typography>
                  Naturally train your body to want to sit at your goal weight
                </Typography>
              </li>
              <li>
                <Typography>Feel healthier, lose weight effectively</Typography>
              </li>
            </ul>
          </Stack>
        </Stack>

        <Box display="flex" position="relative" justifyContent="space-between">
          <Stack gap={1} maxWidth="210px">
            <Typography fontFamily="Georgia, serif" fontSize="17px !important">
              {`${patient?.profiles.first_name}’s Plan`}
            </Typography>
            <Typography>
              {`We’ll help you get everything you need to lose your goal of
              ${
                (weight ?? 0) - (goal_weight ?? 0)
              } pounds – and keep them off.`}
            </Typography>
          </Stack>
          <Image src={ZealthyGLP1Image} alt="Trophy Icon" width="110" />
        </Box>

        <Divider />

        <Box
          bgcolor="#fff"
          border="1px solid lightgrey"
          borderRadius={4}
          padding="24px"
        >
          <Stack gap={1.5}>
            <Typography
              fontFamily="Georgia, serif"
              fontSize="17px !important"
              textAlign="center"
              mb={1}
            >
              What’s included?
            </Typography>
            <Stack direction="row" gap={1} alignItems="center">
              <Image src={RxIcon} alt="Trophy Icon" width="24" />
              <Typography lineHeight="18px !important">
                Prescriptions for Ozempic©, Wegovy©, or similar GLP-1
                medications (cost of medication not included)
              </Typography>
            </Stack>
            <Stack direction="row" gap={1} alignItems="center">
              <Image src={ShieldIcon} alt="Trophy Icon" width="24" />
              <Typography lineHeight="18px !important">
                Insurance coverage support
              </Typography>
            </Stack>
            <Stack direction="row" gap={1} alignItems="center">
              <Image src={ScaleIcon} alt="Trophy Icon" width="24" />
              <Typography lineHeight="18px !important">
                Weight loss coach with unlimited messaging
              </Typography>
            </Stack>
            <Stack direction="row" gap={1} alignItems="center">
              <Image src={StethoscopeIcon} alt="Trophy Icon" width="24" />
              <Typography lineHeight="18px !important">
                24/7 medical provider messaging
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Stack>
          <Box
            border="1px solid lightgrey"
            sx={{
              padding: isMobile ? '1rem 0 1rem 0' : '1rem 0.5rem',
              borderRadius: '1rem',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
              gap: '0.5rem',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => handleChange('bulk')}
          >
            <Box
              sx={{
                width: 'fit-content',
                background: '#005315',
                borderRadius: '1rem',
                textAlign: 'center',
                padding: '0 18px',
                color: '#FFFFFF',
                margin: '0 0 0.2rem 1rem',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <Typography fontWeight="bold">Most Popular</Typography>
            </Box>
            <Box
              sx={{
                borderRadius: '0.75rem',
                background: '#F7F9A5',
                display: 'flex',
                padding: '0 10px',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                alignSelf: 'flex-start',
                fontWeight: 600,
                fontSize: '14px !important',
                marginLeft: '1rem',
              }}
            >{`For a limited time, save $141!`}</Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <Radio
                value={checked}
                checked={checked === 'bulk'}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    marginTop: '0.6rem',
                    width: '95%',
                  }}
                >
                  <Typography variant="h3" fontWeight="600">
                    {'Every 3 months'}
                  </Typography>

                  <Stack direction="row" alignItems="center" gap="5px">
                    <Typography
                      component="span"
                      variant="body1"
                      fontSize={
                        isMobile ? '12px !important' : '1rem !important'
                      }
                      color="#111111"
                      sx={{
                        textDecoration: 'line-through',
                      }}
                    >
                      {`$113/month`}
                    </Typography>
                    {`|`}
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      fontSize={
                        isMobile ? '12px !important' : '1rem !important'
                      }
                      color="#00531B"
                    >
                      {`$88/month`}
                    </Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                  }}
                >
                  <Typography variant="body1" fontSize="1rem !important">
                    {'$88/month for first 3 months'}
                  </Typography>
                  <Typography variant="body1" fontSize="1rem !important">
                    {'$113/month thereafter (paid quarterly)'}
                  </Typography>
                  <Typography variant="subtitle1">
                    {'Cancel anytime'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            border="1px solid lightgrey"
            sx={{
              padding: isMobile ? '1rem 0 1rem 0' : '1rem 0.5rem',
              borderRadius: '1rem',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
            onClick={() => handleChange('single')}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Radio
                value={checked}
                checked={checked === 'single'}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    marginTop: '0.6rem',
                    width: '95%',
                  }}
                >
                  <Typography variant="h3" fontWeight="600">
                    {'Monthly'}
                  </Typography>

                  <Stack direction="row" alignItems="center" gap="5px">
                    <Typography
                      component="span"
                      variant="body1"
                      fontSize={
                        isMobile ? '12px !important' : '1rem !important'
                      }
                      color="#111111"
                      sx={{
                        textDecoration: 'line-through',
                      }}
                    >
                      {`$135/month`}
                    </Typography>
                    {`|`}
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      fontSize={
                        isMobile ? '12px !important' : '1rem !important'
                      }
                      color="#00531B"
                    >
                      {`$39 for first month`}
                    </Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                  }}
                >
                  <Typography variant="body1" fontSize="1rem !important">
                    {'First month $39'}
                  </Typography>
                  <Typography variant="body1" fontSize="1rem !important">
                    {'$135/month thereafter'}
                  </Typography>
                  <Typography variant="subtitle1">
                    {'Cancel anytime'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </Stack>

        <Button onClick={handleContinue}>Continue to Checkout</Button>
        <Divider />
        <Stack
          gap={4}
          textAlign="center"
          justifyContent="center"
          alignItems="center"
        >
          <Stack gap={1} alignItems="center">
            <Typography variant="h4">
              GLP-1 medications backed by research from
            </Typography>
            <Image
              src={Institutions}
              alt="Institutions"
              sizes="100vw"
              style={{
                width: isMobile ? '100%' : '70%',
                height: 'auto',
              }}
            />
          </Stack>
          <Stack gap={1}>
            <Typography fontFamily="Georgia, serif" fontSize="15px !important">
              What makes the Zealthy weight loss program so effective?
            </Typography>
            <Typography fontFamily="Georgia, serif" fontSize="12px !important">
              A <i>new</i> kind of weight loss program
            </Typography>
          </Stack>
          <Box display="flex" flexDirection="column" gap={4} alignSelf="center">
            <Box
              display="grid"
              gridTemplateColumns="125px 1fr"
              gap={1}
              alignSelf="flex-start"
            >
              <Stack direction="row" gap={1} alignItems="center">
                <Image src={TrendDown} alt="Trophy Icon" width="36" />
                <Typography
                  sx={{
                    fontSize: '36px !important',
                    fontWeight: 'bold',
                    color: '#005315',
                  }}
                >
                  15%
                </Typography>
              </Stack>
              <Typography>Average reduction in body weight</Typography>
            </Box>
            <Box
              display="grid"
              gridTemplateColumns="125px 1fr"
              gap={1}
              alignSelf="flex-start"
            >
              <Stack direction="row" gap={1} alignItems="center">
                <Image src={GreenCheckShield} alt="Trophy Icon" width="36" />
                <Typography
                  sx={{
                    fontSize: '36px !important',
                    fontWeight: 'bold',
                    color: '#005315',
                  }}
                >
                  8/10
                </Typography>
              </Stack>
              <Typography textAlign="left">
                Patients report that this is the most effective weight loss
                program they’ve tried
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
};

export default WeightLossPreCheckout;
