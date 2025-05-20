import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import Title from '@/components/shared/Title';
import TermsOfUse from '@/components/shared/TermsOfUse';
import ProviderReviewAlert from '../ProviderReviewAlert';
import Image from 'next/image';
import PaymentForm from '../PaymentForm';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  MedicationType,
  Medication,
} from '@/context/AppContext/reducers/types/visit';
import SleepProductImage from 'public/images/sleep/ramelteon.png';
import { useIsMobile } from '@/components/hooks/useIsMobile';

const items: Medication[] = [
  {
    display_name: 'Ramelteon',
    dosage: 'Standard Dose',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 510 : 500,
    name: 'Ramelteon Medication',
    price: 133,
    quantity: 60,
    recurring: {
      interval: 'month',
      interval_count: 2,
    },
    type: MedicationType.SLEEP,
  },
  {
    display_name: 'Ramelteon',
    dosage: 'Standard Dose',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 509 : 499,
    name: 'Ramelteon Medication',
    price: 78,
    quantity: 30,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    type: MedicationType.SLEEP,
  },
  {
    display_name: 'Ramelteon',
    dosage: 'Standard Dose',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 511 : 501,
    name: 'Ramelteon Medication',
    price: 234,
    quantity: 120,
    recurring: {
      interval: 'month',
      interval_count: 4,
    },
    type: MedicationType.SLEEP,
  },
];

interface Option {
  selectedOptionId: number;
  duration: string;
  pills: number;
  pricePerPill: number;
  originalPricePerPill: number;
  discount: string;
  isMostPopular: boolean;
  medication: Medication;
  originalTotalPrice: number;
  discountedTotalPrice: number;
}

const SleepCheckout = () => {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(1);
  const theme = useTheme();
  const isMobile = useIsMobile();
  const { addMedication } = useVisitActions();

  const options: Option[] = useMemo(() => {
    return [
      {
        selectedOptionId: 0,
        duration: '1 Month Supply',
        pills: 30,
        pricePerPill: 2.6,
        originalPricePerPill: 4.0,
        discount: '35% OFF',
        isMostPopular: false,
        medication: items[1],
      },
      {
        selectedOptionId: 1,
        duration: '2 Month Supply',
        pills: 60,
        pricePerPill: 2.21,
        originalPricePerPill: 4.0,
        discount: '45% OFF',
        isMostPopular: true,
        medication: items[0],
      },
      {
        selectedOptionId: 2,
        duration: '4 Month Supply',
        pills: 120,
        pricePerPill: 1.95,
        originalPricePerPill: 4.0,
        discount: '52% OFF',
        isMostPopular: false,
        medication: items[2],
      },
    ].map(option => {
      const originalTotalPrice = option.pills * option.originalPricePerPill;
      const discountedTotalPrice = option.medication.price!;
      return {
        ...option,
        originalTotalPrice,
        discountedTotalPrice,
      };
    });
  }, []);

  const selectedOption: Option | null = useMemo(() => {
    if (selectedOptionId === null) return null;
    return (
      options.find(option => option.selectedOptionId === selectedOptionId) ||
      null
    );
  }, [selectedOptionId, options]);

  const handleSelect = useCallback((optionId: number) => {
    setSelectedOptionId(optionId);
  }, []);

  useEffect(() => {
    if (selectedOption) {
      addMedication({
        ...selectedOption.medication,
        price: selectedOption.discountedTotalPrice,
        dosage: selectedOption.medication.dosage,
        quantity: selectedOption.medication.quantity,
        recurring: selectedOption.medication.recurring,
        medication_quantity_id:
          selectedOption.medication.medication_quantity_id,
      });
    }
  }, [selectedOption]);

  return (
    <Container maxWidth={isMobile ? 'xs' : 'md'}>
      <Grid
        container
        gap={isMobile ? '16px' : { sm: '25px', xs: '16px' }}
        maxWidth={isMobile ? '100%' : '590px'}
        margin="0 auto"
        direction="column"
      >
        <Stack gap={1}>
          <Title text="Payment Details" />
          <Typography variant="h5">
            Add your payment details. We&apos;ll have a provider review your
            information.
          </Typography>
        </Stack>

        <Stack width="inherit" direction="column" gap="16px">
          <ProviderReviewAlert />

          <Paper
            sx={{
              padding: isMobile ? '8px 16px' : '16px 24px',
              borderRadius: '12px',
              background: '#FFF',
              boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
              border: '1px solid #D8D8D8',
            }}
          >
            <Stack gap="16px">
              <Typography variant="h2">Your plan includes:</Typography>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  backgroundColor: '#F6F6F6',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              >
                <Stack>
                  <Typography
                    variant="h3"
                    fontSize="1.1rem!important"
                    marginTop="10px"
                  >
                    Zealthy Sleep
                  </Typography>
                  <Typography
                    fontSize="1.1rem!important"
                    fontWeight="510"
                    color="#777777"
                    marginTop="20px"
                    marginBottom="20px"
                  >
                    8 mg Ramelteon
                  </Typography>
                  <List>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'text.primary',
                            margin: '0 12px',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Non addictive"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: '1.2rem!important',
                          color: '#777777',
                        }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'text.primary',
                            margin: '0 12px',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="FDA-approved"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: '1.2rem!important',
                          color: '#777777',
                        }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'text.primary',
                            margin: '0 12px',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Restful sleep"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: '1.2rem!important',
                          color: '#777777',
                        }}
                      />
                    </ListItem>
                  </List>
                </Stack>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: isMobile ? 'center' : 'flex-end',
                    alignItems: 'center',
                    flex: 1,
                    marginTop: isMobile ? '16px' : '0',
                  }}
                >
                  <Image
                    src={SleepProductImage}
                    alt="Ramelteon product"
                    style={{
                      objectFit: 'contain',
                      width: isMobile ? '90%' : '250px',
                      maxWidth: '250px',
                      height: 'auto',
                    }}
                  />
                </Box>
              </Box>
              <Stack gap={2}>
                <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
                  <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
                  <Typography>
                    <strong>Provider evaluation</strong>
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center">
                  <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
                  <Typography>
                    <strong>Online check-ins</strong>
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center">
                  <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
                  <Typography>
                    <strong>Free & discreet shipping</strong>
                  </Typography>
                </Stack>
              </Stack>

              <Typography fontWeight={600} sx={{ mt: 3 }}>
                Select your supply
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                Save more by ordering a longer supply.
              </Typography>

              {options.map(option => (
                <Paper
                  key={option.selectedOptionId}
                  onClick={() => handleSelect(option.selectedOptionId)}
                  sx={{
                    border:
                      selectedOptionId === option.selectedOptionId
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${theme.palette.text.primary}`,
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'center' : 'center',
                    cursor: 'pointer!important',
                    backgroundColor:
                      selectedOptionId === option.selectedOptionId
                        ? theme.palette.secondary.main
                        : '#FFF',
                    marginBottom: '16px',
                  }}
                >
                  <Stack gap={1}>
                    <Typography fontWeight={600}>
                      {option.duration} - {option.pills} tablets
                    </Typography>

                    <Typography fontWeight={600}>
                      <Stack direction="row" gap={1} alignItems="center">
                        <Typography
                          sx={{
                            textDecoration: 'line-through',
                          }}
                          color="text.secondary"
                        >
                          ${option.originalTotalPrice.toFixed(2)}
                        </Typography>
                        <Typography color="primary">
                          ${option.discountedTotalPrice.toFixed(2)}
                        </Typography>
                      </Stack>
                    </Typography>
                    <Typography variant="body2">
                      ${option.pricePerPill.toFixed(2)} / Pill
                    </Typography>
                  </Stack>

                  {option.isMostPopular && (
                    <Box
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: '#FFF',
                        borderRadius: '12px',
                        padding: '4px 8px',
                      }}
                    >
                      Most Popular
                    </Box>
                  )}
                </Paper>
              ))}

              <Typography fontWeight={600}>Selected Option:</Typography>
              {selectedOption ? (
                <Typography>
                  You selected the <strong>{selectedOption.duration}</strong>{' '}
                  with <strong>{selectedOption.pills} tablets</strong> at{' '}
                  <strong>
                    ${selectedOption.discountedTotalPrice.toFixed(2)}
                  </strong>
                  .
                </Typography>
              ) : (
                <Typography>Please select an option to proceed.</Typography>
              )}
            </Stack>
            <Divider sx={{ margin: '16px -24px' }} />
            <Typography color={theme.palette.primary.light}>
              You will only be charged if prescribed
            </Typography>
          </Paper>

          <Paper
            sx={{
              padding: isMobile ? '8px 16px' : '16px 24px',
              borderRadius: '12px',
              background: '#FFF',
              boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
              border: '1px solid #D8D8D8',
            }}
          >
            {selectedOption && (
              <>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={600}>
                    Total Before Discount
                  </Typography>
                  <Typography fontWeight={600}>
                    ${selectedOption.originalTotalPrice.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={600}>Discount</Typography>
                  <Typography fontWeight={600} color="green">
                    -$
                    {(
                      selectedOption.originalTotalPrice -
                      selectedOption.discountedTotalPrice
                    ).toFixed(2)}
                  </Typography>
                </Stack>
                <Divider sx={{ marginY: '8px' }} />
              </>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>Total</Typography>
              <Typography fontWeight={600}>
                {selectedOption
                  ? `$${selectedOption.discountedTotalPrice.toFixed(2)}`
                  : '$0.00'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Typography variant="body2" fontWeight={600}>
                Due Now
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                $0.00
              </Typography>
            </Stack>
          </Paper>

          {selectedOption && (
            <PaymentForm
              medicationQuantityId={
                selectedOption.medication.medication_quantity_id || 0
              }
              amount={0}
              buttonText="Pay $0 today"
            />
          )}
          <TermsOfUse
            hasAppointment={false}
            selectedMedication={selectedOption?.medication}
          />
        </Stack>
      </Grid>
    </Container>
  );
};

export default SleepCheckout;
