import Box from '@mui/material/Box';
import {
  Radio,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import { useCallback, useState, useEffect } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import Loading from '@/components/shared/Loading/Loading';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import CustomText from '@/components/shared/Text';
import { useVisitState } from '@/components/hooks/useVisit';
import { useLanguage } from '@/components/hooks/data';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

const WeightLossDeal = () => {
  const [subscriptionSingle, setSubscriptionSingle] =
    useState<Subscription | null>(null);
  const [subscriptionBulk, setSubscriptionBulk] = useState<Subscription | null>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { addCoaching, removeCoaching } = useCoachingActions();
  const { addPotentialInsurance } = useIntakeActions();
  const { id: visit_id } = useVisitState();

  const supabase = useSupabaseClient<Database>();
  const name = 'Zealthy Weight Loss';
  const language = useLanguage();

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
  }, [supabase]);

  const handleContinue = useCallback(async () => {
    if (!checked) return setError('Please select an option above to continue.');
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
      addPotentialInsurance(PotentialInsuranceOption.OH);
    } else {
      addCoaching({
        type: CoachingType.WEIGHT_LOSS,
        name:
          language === 'esp'
            ? 'Programa de perdida de peso por Zealthy'
            : 'Zealthy Weight Loss Program',
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
  }, [checked]);
  const handleChange = (value: string) => {
    setChecked(value);
  };

  return (
    <CenteredContainer maxWidth="sm" gap="16px">
      {subscriptionSingle === null || subscriptionBulk === null ? (
        <Loading />
      ) : (
        <>
          <Typography variant="h2">
            {
              'For a limited time, you can save up to $141 to achieve lasting weight loss!'
            }
          </Typography>
          <Typography variant="subtitle1" mb="1rem">
            {
              'Achieving lasting weight loss typically takes at least 3-6 months. Save on a longer plan for better results.'
            }
          </Typography>
          <Stack gap="24px">
            <Box
              sx={{
                padding: isMobile ? '1rem 0 1rem 0' : '1.5rem',
                borderRadius: '1rem',
                background: '#ffffff',
                boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
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
                  width: '8.875rem',
                  height: '1.5rem',
                  background: '#005315',
                  borderRadius: '1rem',
                  textAlign: 'center',
                  padding: '3px',
                  color: '#FFFFFF',
                  margin: '0 0 1rem 1rem',
                }}
              >
                <Typography variant="subtitle1">Most Popular</Typography>
              </Box>
              <Box
                sx={{
                  borderRadius: '0.75rem',
                  background: '#F7F9A5',
                  display: 'flex',
                  padding: '0 8px',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  alignSelf: 'flex-start',
                  fontWeight: 600,
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

                    <Typography
                      variant="body1"
                      fontSize={
                        isMobile ? '12px !important' : '1rem !important'
                      }
                      color="#00531B"
                      textAlign="end"
                    >
                      <Typography
                        component="span"
                        variant="body1"
                        fontSize={
                          isMobile ? '12px !important' : '1rem !important'
                        }
                        color="#111111"
                        sx={{
                          textDecoration: 'line-through',
                          marginRight: '0.2rem',
                          width: '20px',
                        }}
                      >
                        {`$135/month`}
                      </Typography>
                      {`| $88/mo.`}
                    </Typography>
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
              sx={{
                padding: isMobile ? '1rem 0 1rem 0' : '1.5rem',
                borderRadius: '1rem',
                background: '#ffffff',
                boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '1rem',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
              onClick={() => handleChange('single')}
            >
              <Box
                sx={{
                  borderRadius: '0.75rem',
                  background: '#F7F9A5',
                  display: 'flex',
                  padding: '0 8px',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  alignSelf: 'flex-start',
                  fontWeight: 600,
                  marginLeft: '1rem',
                }}
              >{`For a limited time, save $86!`}</Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
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

                    <Typography
                      variant="body1"
                      fontSize={
                        isMobile ? '12px !important' : '1rem !important'
                      }
                      color="#00531B"
                      textAlign="end"
                    >
                      <Typography
                        component="span"
                        variant="body1"
                        fontSize={
                          isMobile ? '12px !important' : '1rem !important'
                        }
                        color="#111111"
                        sx={{
                          textDecoration: 'line-through',
                          marginRight: '0.2rem',
                          width: '20px',
                        }}
                      >
                        {`$135/month`}
                      </Typography>
                      {`| $39 first mo.`}
                    </Typography>
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
            {error ? (
              <CustomText textAlign="center" color="red">
                {error}
              </CustomText>
            ) : null}
            <LoadingButton loading={loading} onClick={handleContinue}>
              Continue
            </LoadingButton>
          </Stack>
        </>
      )}
    </CenteredContainer>
  );
};

export default WeightLossDeal;
