import { ChangeEvent, useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import ArrowRight from '@/components/shared/icons/ArrowRight';
import { Database } from '@/lib/database.types';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { SubProps } from '../SubscriptionContent';
import { addWeeks, format, subWeeks } from 'date-fns';

type PatientAddress = Database['public']['Tables']['address']['Row'];
type Prescription = Database['public']['Tables']['prescription']['Row'];

interface RefillProps {
  selectedSubscription: SubProps | null;
  changeRefillDate: (
    referenceId: string,
    newDate: number,
    isGetNow: boolean
  ) => void;
  patientAddress: PatientAddress | null;
  patientPayment: string;
  getItNow?: boolean;
}
export function ChangeRefillDate({
  selectedSubscription,
  changeRefillDate,
  patientAddress,
  patientPayment,
  getItNow,
}: RefillProps) {
  const [page, setPage] = useState(getItNow ? 'get-now' : 'choose-refill');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [value, setValue] = useState<string>('standard');
  const isED = selectedSubscription?.care === 'ED';

  const medDisplayname =
    selectedSubscription?.order_id?.prescription_id?.medication_quantity_id
      ?.medication_dosage_id?.medication?.display_name;

  const isBirthControl = medDisplayname
    ?.toLowerCase()
    ?.includes('birth control');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Container sx={{ maxWidth: '448px' }}>
      {page === 'choose-refill' && (
        <>
          <Typography component="h2" variant="h2" sx={{ marginBottom: '16px' }}>
            Change your next Zealthy refill.
          </Typography>
          <Typography
            component="h2"
            variant="h2"
            sx={{
              color: '#1B1B1B',
              fontWeight: '500',
              marginBottom: '48px',
            }}
          >
            Next refill scheduled for:{' '}
            {format(
              new Date(selectedSubscription?.current_period_end || ''),
              'MMMM do, yyyy'
            )}
          </Typography>
          <Box sx={{ marginBottom: '48px', gap: '16px' }}>
            <Typography
              component="h3"
              variant="h3"
              sx={{
                color: '#1B1B1B',
                fontWeight: '500',
                marginBottom: '16px',
              }}
            >
              Get sooner
            </Typography>
            <Box
              component="div"
              sx={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '0.5px solid #CCCCCC',
                borderRadius: '16px',
                padding: '24px',
                height: '94px',
                justifyContent: 'space-between',
                marginBottom: '16px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setPage('get-now');
              }}
            >
              <Box>
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    lineHeight: '24px',
                    lineSpacing: '0.3px',
                    color: '#1B1B1B',
                  }}
                >
                  Get now
                </Typography>
                <Typography
                  component="h3"
                  variant="h3"
                  sx={{
                    color: '#989898',
                    fontWeight: '500',
                    fontSize: '14px !important',
                  }}
                >
                  Refill on {format(new Date(), 'MMMM do, yyyy')}
                </Typography>
              </Box>
              <ArrowRight
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                }}
              />
            </Box>
            <Box
              component="div"
              sx={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '0.5px solid #CCCCCC',
                borderRadius: '16px',
                padding: '24px',
                height: '94px',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => {
                setPage('refill-sooner');
                setSelectedDate(
                  format(
                    subWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      1
                    ),
                    'MMMM do, yyyy'
                  )
                );
                changeRefillDate(
                  selectedSubscription?.reference_id || '',
                  subWeeks(
                    new Date(selectedSubscription?.current_period_end || ''),
                    1
                  ).valueOf(),
                  false
                );
              }}
            >
              <Box>
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    lineHeight: '24px',
                    lineSpacing: '0.3px',
                    color: '#1B1B1B',
                  }}
                >
                  1 week earlier
                </Typography>
                <Typography
                  component="h3"
                  variant="h3"
                  sx={{
                    color: '#989898',
                    fontWeight: '500',
                    fontSize: '14px !important',
                  }}
                >
                  Refill on{' '}
                  {format(
                    subWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      1
                    ),
                    'MMMM do, yyyy'
                  )}
                </Typography>
              </Box>
              <ArrowRight
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                }}
              />
            </Box>
          </Box>
          <Box sx={{ marginBottom: '48px' }}>
            <Typography
              component="h3"
              variant="h3"
              sx={{
                color: '#1B1B1B',
                fontWeight: '500',
                marginBottom: '1rem',
              }}
            >
              Get Later
            </Typography>
            <Box
              component="div"
              sx={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '0.5px solid #CCCCCC',
                borderRadius: '16px',
                padding: '24px',
                height: '94px',
                justifyContent: 'space-between',
                marginBottom: '16px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setPage('refill-later');
                setSelectedDate(
                  format(
                    addWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      1
                    ),
                    'MMMM do, yyyy'
                  )
                );
                changeRefillDate(
                  selectedSubscription?.reference_id || '',
                  addWeeks(
                    new Date(selectedSubscription?.current_period_end || ''),
                    1
                  ).valueOf(),
                  false
                );
              }}
            >
              <Box>
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    lineHeight: '24px',
                    lineSpacing: '0.3px',
                    color: '#1B1B1B',
                  }}
                >
                  By 1 week
                </Typography>
                <Typography
                  component="h3"
                  variant="h3"
                  sx={{
                    color: '#989898',
                    fontWeight: '500',
                    fontSize: '14px !important',
                  }}
                >
                  Refill on{' '}
                  {format(
                    addWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      1
                    ),
                    'MMMM do, yyyy'
                  )}
                </Typography>
              </Box>
              <ArrowRight
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                }}
              />
            </Box>
            <Box
              component="div"
              sx={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '0.5px solid #CCCCCC',
                borderRadius: '16px',
                padding: '24px',
                height: '94px',
                justifyContent: 'space-between',
                marginBottom: '16px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setPage('refill-later');
                setSelectedDate(
                  format(
                    addWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      2
                    ),
                    'MMMM do, yyyy'
                  )
                );
                changeRefillDate(
                  selectedSubscription?.reference_id || '',
                  addWeeks(
                    new Date(selectedSubscription?.current_period_end || ''),
                    2
                  ).valueOf(),
                  false
                );
              }}
            >
              <Box>
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    lineHeight: '24px',
                    lineSpacing: '0.3px',
                    color: '#1B1B1B',
                  }}
                >
                  By 2 weeks
                </Typography>
                <Typography
                  component="h3"
                  variant="h3"
                  sx={{
                    color: '#989898',
                    fontWeight: '500',
                    fontSize: '14px !important',
                  }}
                >
                  Refill on{' '}
                  {format(
                    addWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      2
                    ),
                    'MMMM do, yyyy'
                  )}
                </Typography>
              </Box>
              <ArrowRight
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                }}
              />
            </Box>
            <Box
              component="div"
              sx={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '0.5px solid #CCCCCC',
                borderRadius: '16px',
                padding: '24px',
                height: '94px',
                justifyContent: 'space-between',
                marginBottom: '16px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setPage('refill-later');
                setSelectedDate(
                  format(
                    addWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      4
                    ),
                    'MMMM do, yyyy'
                  )
                );
                changeRefillDate(
                  selectedSubscription?.reference_id || '',
                  addWeeks(
                    new Date(selectedSubscription?.current_period_end || ''),
                    4
                  ).valueOf(),
                  false
                );
              }}
            >
              <Box>
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    lineHeight: '24px',
                    lineSpacing: '0.3px',
                    color: '#1B1B1B',
                  }}
                >
                  By 4 weeks
                </Typography>
                <Typography
                  component="h3"
                  variant="h3"
                  sx={{
                    color: '#989898',
                    fontWeight: '500',
                    fontSize: '14px !important',
                  }}
                >
                  Refill on{' '}
                  {format(
                    addWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      4
                    ),
                    'MMMM do, yyyy'
                  )}
                </Typography>
              </Box>
              <ArrowRight
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                }}
              />
            </Box>
            <Box
              component="div"
              sx={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '0.5px solid #CCCCCC',
                borderRadius: '16px',
                padding: '24px',
                height: '94px',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => {
                setPage('refill-later');
                setSelectedDate(
                  format(
                    addWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      8
                    ),
                    'MMMM do, yyyy'
                  )
                );
                changeRefillDate(
                  selectedSubscription?.reference_id || '',
                  addWeeks(
                    new Date(selectedSubscription?.current_period_end || ''),
                    8
                  ).valueOf(),
                  false
                );
              }}
            >
              <Box>
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    lineHeight: '24px',
                    lineSpacing: '0.3px',
                    color: '#1B1B1B',
                  }}
                >
                  By 8 weeks
                </Typography>
                <Typography
                  component="h3"
                  variant="h3"
                  sx={{
                    color: '#989898',
                    fontWeight: '500',
                    fontSize: '14px !important',
                  }}
                >
                  Refill on{' '}
                  {format(
                    addWeeks(
                      new Date(selectedSubscription?.current_period_end || ''),
                      8
                    ),
                    'MMMM do, yyyy'
                  )}
                </Typography>
              </Box>
              <ArrowRight
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                }}
              />
            </Box>
          </Box>
          <Button
            // variant="outlined"
            type="button"
            sx={{
              width: '100%',
              background: '#EEEEEE',
              color: '#1b1b1b',
              '&:hover': { background: '#CCCCCC' },
            }}
            onClick={() => Router.back()}
          >
            Back
          </Button>
        </>
      )}
      {page === 'refill-sooner' && (
        <>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="h2"
              variant="h2"
              sx={{ marginBottom: '16px' }}
            >
              {`We'll refill sooner!`}
            </Typography>
            <Typography
              component="h3"
              variant="h3"
              sx={{
                color: '#1B1B1B',
                fontWeight: '500',
                marginBottom: '12px',
              }}
            >
              {`Your next refill will be processed on ${selectedDate}`}
            </Typography>
            <Typography
              component="h3"
              variant="h3"
              sx={{
                color: '#989898',
                fontWeight: '500',
                fontSize: '14px !important',
                marginBottom: '48px',
              }}
            >
              If you want a Zealthy refill later, request it from your
              subscriptions page.
            </Typography>
            <Button
              type="button"
              onClick={() => Router.replace(Pathnames.PATIENT_PORTAL)}
              sx={{ width: '90%' }}
            >
              Back Home
            </Button>
          </Box>
        </>
      )}
      {page === 'refill-later' && (
        <>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="h2"
              variant="h2"
              sx={{ marginBottom: '16px' }}
            >
              {`We'll refill later`}
            </Typography>
            <Typography
              component="h3"
              variant="h3"
              sx={{
                color: '#1B1B1B',
                fontWeight: '500',
                marginBottom: '12px',
              }}
            >
              {`Your next refill will be processed on ${selectedDate}`}
            </Typography>
            <Typography
              component="h3"
              variant="h3"
              sx={{
                color: '#989898',
                fontWeight: '500',
                fontSize: '14px !important',
                marginBottom: '48px',
              }}
            >
              If you want a Zealthy refill sooner, request it from your
              subscriptions page.
            </Typography>
            <Button
              type="button"
              onClick={() => Router.replace(Pathnames.PATIENT_PORTAL)}
              sx={{ width: '90%' }}
            >
              Back Home
            </Button>
          </Box>
        </>
      )}
      {page === 'get-now' && (
        <>
          <Box>
            <Typography
              component="h2"
              variant="h2"
              sx={{ marginBottom: '48px' }}
            >
              Get your Zealthy refill now.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                border: '1px solid #D8D8D8',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '48px',
                background: '#FFFFFF',
              }}
            >
              <Typography
                component="h4"
                variant="body1"
                sx={{ color: '#989898' }}
              >
                Medication
              </Typography>
              <Typography
                component="h3"
                variant="h3"
                sx={{
                  color: '#1B1B1B',
                  fontWeight: '500',
                  marginBottom: '16px',
                }}
              >
                {isED
                  ? selectedSubscription?.product!
                  : `${selectedSubscription?.order_id?.prescription_id?.medication
                      ?.split(' ')[0]
                      .charAt(0)
                      .toUpperCase()}${selectedSubscription?.order_id?.prescription_id?.medication
                      ?.split(' ')[0]
                      .slice(1)}`}
              </Typography>
              <Typography
                component="h4"
                variant="body1"
                sx={{ color: '#989898' }}
              >
                Dosage Instructions
              </Typography>
              <Typography
                component="h3"
                variant="h3"
                sx={{
                  color: '#1B1B1B',
                  fontWeight: '500',
                  marginBottom: '16px',
                }}
              >
                {` ${
                  isBirthControl
                    ? `Pack${
                        (selectedSubscription?.order_id?.prescription_id
                          ?.dispense_quantity ?? 0) > 1
                          ? 's'
                          : ''
                      }, `
                    : selectedSubscription?.order_id?.prescription_id?.unit
                    ? `${
                        selectedSubscription?.order_id?.prescription_id?.unit
                      }${
                        (selectedSubscription?.order_id?.prescription_id
                          ?.dispense_quantity ?? 0) > 1
                          ? 's'
                          : ''
                      }, `
                    : ''
                } ${
                  selectedSubscription?.order_id?.prescription_id
                    ?.dosage_instructions || ''
                }`}
              </Typography>
              <Typography
                component="h4"
                variant="body1"
                sx={{ color: '#989898' }}
              >
                Quantity
              </Typography>
              <Typography
                component="h3"
                variant="h3"
                sx={{
                  color: '#1B1B1B',
                  fontWeight: '500',
                  marginBottom: '16px',
                }}
              >
                {isED
                  ? `${selectedSubscription.order_id?.prescription_id?.dispense_quantity} hardies`
                  : selectedSubscription?.order_id?.prescription_id?.medication
                      ?.split(' ')
                      .slice(1)
                      .join(' ')}
              </Typography>
              <Typography
                component="h4"
                variant="body1"
                sx={{ color: '#989898', marginBottom: '16px' }}
              >
                Delivery options
              </Typography>
              <FormControl>
                <RadioGroup
                  aria-labelledby="delivery-options"
                  defaultValue="standard"
                  name="radio-buttons-group"
                  value={value}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="standard"
                    control={<Radio />}
                    sx={{ marginBottom: '10px' }}
                    label={
                      <>
                        <Typography
                          sx={{
                            fontWeight: '600',
                            fontSize: '14px !important',
                            lineHeight: '20px',
                            letterSpacing: '-0.006em',
                            color: '#1B1B1B',
                          }}
                        >
                          UPS Mail Innovations - $0
                        </Typography>
                        <Typography>Usually arrives in 2-5 days</Typography>
                      </>
                    }
                  />
                  <FormControlLabel
                    value="express"
                    control={<Radio />}
                    sx={{ marginBottom: '16px' }}
                    label={
                      <>
                        <Typography
                          sx={{
                            fontWeight: '600',
                            fontSize: '14px !important',
                            lineHeight: '20px',
                            letterSpacing: '-0.006em',
                            color: '#1B1B1B',
                          }}
                        >
                          UPS Next Day Air Saver - $15
                        </Typography>
                        <Typography>Usually arrives in 1-2 days</Typography>
                      </>
                    }
                  />
                </RadioGroup>
              </FormControl>
              <Typography
                component="h4"
                variant="body1"
                sx={{ color: '#989898' }}
              >
                Delivery address
              </Typography>
              <Box sx={{ marginBottom: '16px' }}>
                <Typography>{patientAddress?.address_line_1}</Typography>
                <Typography>{patientAddress?.address_line_2}</Typography>
                <Typography>
                  {patientAddress?.city}, {patientAddress?.state}
                </Typography>
                <Typography>{patientAddress?.zip_code}</Typography>
                <Typography>United States</Typography>
                <Button
                  variant="text"
                  sx={{
                    justifyContent: 'flex-start',
                    padding: 0,
                    width: '50px',
                    color: '#00872B',
                    height: '24px !important',
                  }}
                  onClick={() => Router.back()}
                >
                  Edit
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <Typography
                  component="h4"
                  variant="body1"
                  sx={{ color: '#989898' }}
                >
                  Payment
                </Typography>
                <Typography>{patientPayment}</Typography>
                <Button
                  variant="text"
                  sx={{
                    justifyContent: 'flex-start',
                    padding: 0,
                    width: '50px',
                    color: '#00872B',
                    height: '24px !important',
                  }}
                  onClick={() => Router.back()}
                >
                  Edit
                </Button>
              </Box>
            </Box>
          </Box>
          <Stack gap={2}>
            <Button
              fullWidth
              type="button"
              onClick={() => {
                changeRefillDate(
                  selectedSubscription?.reference_id || '',
                  new Date().valueOf(),
                  true
                );
                Router.replace(Pathnames.PATIENT_PORTAL);
              }}
            >
              {`Confirm order - $${
                value === 'standard'
                  ? selectedSubscription?.order_id?.amount_paid ?? 0
                  : (selectedSubscription?.order_id?.amount_paid ?? 0) + 15
              }`}
            </Button>
            <Button
              fullWidth
              color="grey"
              type="button"
              onClick={() => Router.back()}
            >
              Go Back
            </Button>
          </Stack>
        </>
      )}
    </Container>
  );
}
