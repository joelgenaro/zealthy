import { useEffect, useState } from 'react';
import {
  Box,
  Radio,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCoachingActions } from '@/components/hooks/useCoaching';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

const WeightLossOhioOptions = ({ selected, updateOrder }: any) => {
  const supabase = useSupabaseClient<Database>();
  const name = 'Zealthy Weight Loss';
  const [subscriptionSingle, setSubscriptionSingle] =
    useState<Subscription | null>(null);
  const [subscriptionBulk, setSubscriptionBulk] = useState<Subscription | null>(
    null
  );
  const [checked, setChecked] = useState<string>(
    selected?.name === 'Zealthy 3-Month Weight Loss Plan' ? 'bulk' : 'single'
  );
  const { addCoaching } = useCoachingActions();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const handleChange = (value: string) => {
    setChecked(value);
    if (value === 'bulk') {
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
      updateOrder((order: any) => ({
        ...order,
        coaching: [
          {
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
          },
        ],
      }));
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
      updateOrder((order: any) => ({
        ...order,
        coaching: [
          {
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
          },
        ],
      }));
    }
  };

  return (
    <Stack
      sx={{
        borderRadius: '0.75rem',
        border: '1px solid #D8D8D8',
        background: '#FFF',
        padding: isMobile ? '1rem' : '2rem',
      }}
    >
      <Typography variant="h3" mb="1rem">
        {'Choose the plan that’s right for you.'}
      </Typography>
      <Box
        sx={{
          padding: isMobile ? '1rem 0 1rem 0' : '1.5rem',
          borderRadius: '1rem',
          background: '#ffffff',
          boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '1rem',
          gap: '1rem',
          cursor: 'pointer',
          position: 'relative',
          border: '1px solid #D8D8D8',
        }}
        onClick={() => handleChange('bulk')}
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
            marginLeft: isMobile ? '1rem' : 0,
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
                gap: '1rem',
                width: '95%',
                margin: '0.6rem 0 1rem 0',
              }}
            >
              <Typography variant="h3" fontWeight="600">
                {'Every 3 months'}
              </Typography>

              <Typography
                variant="body1"
                fontSize={isMobile ? '12px !important' : '1rem !important'}
                color="#00531B"
                textAlign="end"
              >
                <Typography
                  component="span"
                  variant="body1"
                  fontSize={isMobile ? '12px !important' : '1rem !important'}
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
            <Typography variant="body1" fontSize="1rem !important">
              {'$339 every 3 months thereafter. Cancel anytime.'}
            </Typography>
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
          cursor: 'pointer',
          border: '1px solid #D8D8D8',
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
                alignItems: 'center',
                margin: '0.6rem 0 1rem 0',
                width: '95%',
              }}
            >
              <Typography variant="h3" fontWeight="600">
                {'Monthly'}
              </Typography>

              <Typography
                variant="body1"
                fontSize={isMobile ? '12px !important' : '1rem !important'}
                color="#00531B"
                textAlign="end"
              >
                <Typography
                  component="span"
                  variant="body1"
                  fontSize={isMobile ? '12px !important' : '1rem !important'}
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
            <Typography variant="body1" fontSize="1rem !important">
              {'$135/month thereafter. Cancel anytime.'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};

export default WeightLossOhioOptions;
