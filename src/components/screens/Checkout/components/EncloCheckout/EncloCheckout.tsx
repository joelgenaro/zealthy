import Router from 'next/router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Container,
  Divider,
  Stack,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import TermsOfUse from '@/components/shared/TermsOfUse';
import { Pathnames } from '@/types/pathnames';
import { useSelector } from '@/components/hooks/useSelector';
import ConsultationFee from '../ConsultationFee';
import PaymentForm from '../PaymentForm';
import {
  MedicationType,
  Medication,
} from '@/context/AppContext/reducers/types/visit';
import { useVisitActions } from '@/components/hooks/useVisit';
import Image from 'next/image';
import { usePatient, useVWOVariationName } from '@/components/hooks/data';
import CheckIcon from '@mui/icons-material/Check';
import { Check } from '@mui/icons-material';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import Checkout from '../../Checkout';
import { useCanRemove } from '@/components/hooks/useCanRemove';
import { Order } from '../../types';
import enclomipheneBottle from '/public/images/enclom_bottle.png';
import Loading from '@/components/shared/Loading/Loading';
import { trackWithDeduplication } from '@/utils/freshpaint/utils';

const EncloCheckout = () => {
  const [order, setOrder] = useState<Order>({
    subscriptions: [],
    visit: null,
    medications: [],
    coaching: [],
    consultation: [],
  });

  const medication = useSelector(store =>
    store.visit.medications.find(m => m.type === MedicationType.ENCLOMIPHENE)
  );
  const visitId = useSelector(store => store.visit.id);
  const { addMedication } = useVisitActions();
  const consultation = useSelector(store => store.consultation) || [];
  const canRemove = useCanRemove(order);

  const { data: patient } = usePatient();
  const { data: variationData, isLoading } = useVWOVariationName('7865_3');

  const isMobile = useIsMobile();

  useEffect(() => {
    trackWithDeduplication('checkout-page');
  }, []);

  useLayoutEffect(() => {
    if (!visitId) {
      Router.push(Pathnames.CARE_SELECTION);
      return;
    }
  }, [visitId]);

  const getImage = () => {
    switch (medication?.name) {
      case 'Enclomiphene Medication':
        return enclomipheneBottle;
      default:
        return enclomipheneBottle;
    }
  };

  // Sum consultation fees => "due now"
  const dueNow = useMemo(() => {
    if (!consultation.length) return 0;
    return consultation.reduce((acc, c) => acc + (c.price || 0), 0);
  }, [consultation]);

  const enclomItems: Medication[] = [
    {
      name: 'Enclomiphene Medication',
      display_name: 'Enclomiphene Medication',
      type: MedicationType.ENCLOMIPHENE,
      dosage: 'Standard Dose',
      quantity: 365,
      recurring: { interval: 'month', interval_count: 12 },
      medication_quantity_id:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 353 : 302,
      price: 1188, // $99 x 12
    },
    {
      name: 'Enclomiphene Medication',
      display_name: 'Enclomiphene Medication',
      type: MedicationType.ENCLOMIPHENE,
      dosage: 'Standard Dose',
      quantity: 90,
      recurring: { interval: 'month', interval_count: 3 },
      medication_quantity_id:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 298 : 299,
      price: 420, // $140 x 3
    },
    {
      name: 'Enclomiphene Medication',
      display_name: 'Enclomiphene Medication',
      type: MedicationType.ENCLOMIPHENE,
      dosage: 'Standard Dose',
      quantity: 30,
      recurring: { interval: 'month', interval_count: 1 },
      medication_quantity_id:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 297 : 298,
      price: 190, // $190 x 1
    },
  ];

  // Plan options
  const planOptions = useMemo(() => {
    return [
      {
        id: 0,
        title: 'Yearly Plan',
        subTitle: 'Billed every 12 months',
        quantity: 365,
        price: 1188,
        monthlyEquivalent: 99,
        savings: '$1092 yearly savings',
        medication: enclomItems[0],
      },
      {
        id: 1,
        title: 'Quarterly Plan',
        subTitle: 'Billed every 3 months',
        quantity: 90,
        price: 420,
        monthlyEquivalent: 140,
        savings: '$600 yearly savings',
        medication: enclomItems[1],
      },
      {
        id: 2,
        title: 'Monthly Plan',
        subTitle: 'Billed every month',
        quantity: 30,
        price: 190,
        monthlyEquivalent: 190,
        savings: '',
        medication: enclomItems[2],
      },
    ];
  }, []);

  const [selectedOptionId, setSelectedOptionId] = useState<number>(1);
  const selectedPlan = planOptions.find(p => p.id === selectedOptionId);

  useEffect(() => {
    if (selectedPlan) {
      addMedication({
        ...selectedPlan.medication,
        name: selectedPlan.medication.name,
        display_name: selectedPlan.medication.display_name,
        type: MedicationType.ENCLOMIPHENE,
        price: selectedPlan.price,
        discounted_price: selectedPlan.price,
        dosage: selectedPlan.medication.dosage,
        quantity: selectedPlan.quantity,
        recurring: selectedPlan.medication.recurring,
        medication_quantity_id: selectedPlan.medication.medication_quantity_id,
      });
    }
  }, [selectedOptionId, selectedPlan, addMedication]);

  const totalAfterPrescription = selectedPlan ? selectedPlan.price : 0;
  const handleSelectPlan = (id: number) => setSelectedOptionId(id);

  if (isLoading || !variationData) return <Loading />;

  if (variationData?.variation_name === 'Variation-1') {
    return (
      <Container maxWidth="sm" sx={{ background: '#FFFFFF' }}>
        <Box mb={2} textAlign="center">
          <Typography color="#8C8C8C" fontWeight={700} mb={1}>
            Payment Details
          </Typography>
          <Typography variant="h2" mb={2}>
            {`Almost done, ${patient?.profiles.first_name || ''}!` ||
              'Almost done!'}
          </Typography>

          <Typography
            variant="h3"
            color="#086039"
            fontWeight={700}
            textAlign="center"
          >
            Confirm your order and payment details.
          </Typography>
        </Box>
        <Box
          sx={{
            borderRadius: 5,
            mb: 3,
            p: 1,
            border: !isMobile ? '1px solid #DADADA' : undefined,
            boxShadow: isMobile ? '0px 4px 14px 3px #0000001C' : undefined,
          }}
        >
          <Box
            sx={{
              borderRadius: 5,
            }}
          >
            <Box sx={{ borderRadius: 2, p: 2 }}>
              <Typography variant="h2" mb={1}>
                Your plan includes
              </Typography>
              <List>
                {[
                  'Provider review',
                  'Medical adjustments',
                  'Ongoing check-ins',
                  'Free & discreet shipping',
                ].map((item, index) => (
                  <ListItem
                    key={`static-${index}`}
                    disableGutters
                    sx={{ py: 0.3, my: -0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                      <CheckIcon
                        sx={{
                          color: '#4CAF50',
                          fontSize: '1.3rem',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          fontWeight="bold"
                          variant="body2"
                          fontSize={!isMobile ? '1.2rem!important' : '1rem'}
                        >
                          {item}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {consultation.map((c, index) => (
                  <ListItem
                    key={`consultation-${index}`}
                    disableGutters
                    sx={{ my: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{
                            boxShadow: '0px 4px 14px 3px #0000001C',
                            p: 2,
                            borderRadius: 5,
                          }}
                        >
                          <Typography
                            fontWeight="bold"
                            variant="body2"
                            fontSize={!isMobile ? '1.2rem!important' : '1rem'}
                          >
                            {c.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontSize={!isMobile ? '1.2rem!important' : '1rem'}
                            color="#666"
                          >
                            ${c.price.toFixed(2)}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
                {selectedPlan && (
                  <ListItem disableGutters sx={{ py: 0.3, my: -0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                      <CheckIcon
                        sx={{
                          color: '#4CAF50',
                          fontSize: '1.3rem',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          fontWeight="bold"
                          variant="body2"
                          fontSize={!isMobile ? '1.2rem!important' : '1rem'}
                        >
                          {selectedPlan.medication.name}
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
              <Stack
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                gap={isMobile ? 0 : 2}
              >
                <Typography
                  color="#777"
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    wordWrap: isMobile ? 'break-word' : 'normal',
                    overflowWrap: isMobile ? 'break-word' : 'normal',
                    whiteSpace: isMobile ? 'normal' : 'nowrap',
                    textAlign: 'center',
                    maxWidth: isMobile ? '100px' : '200px',
                  }}
                >
                  {selectedPlan
                    ? `${selectedPlan.medication.dosage} x ${selectedPlan.quantity} capsules`
                    : 'Standard Dose'}
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                  }}
                >
                  <Image
                    width={200}
                    height={200}
                    style={{
                      objectFit: 'contain',
                      position: 'absolute',
                      transform: 'translate(-25%, -20%)',
                    }}
                    alt={medication?.name || ''}
                    src={medication?.image || getImage() || ''}
                  />
                </Box>
              </Stack>
              <Stack
                sx={{
                  borderRadius: 5,
                  pl: 2,
                  pr: 2,
                  pb: 2,
                  background:
                    'linear-gradient(180deg, #FFFFFF 0%, #ECFFF2 100%)',
                }}
              >
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    background: '#FFFFFF',
                    borderRadius: 5,
                  }}
                >
                  <Typography
                    variant={!isMobile ? 'h3' : undefined}
                    fontWeight="bold"
                    fontSize={isMobile ? '1.2rem!important' : undefined}
                    mb={2}
                    p={2}
                    textAlign={isMobile ? 'left' : undefined}
                  >
                    Billing Frequency
                  </Typography>
                  <Stack gap={2}>
                    {planOptions.map(plan => (
                      <Paper
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan.id)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border:
                            selectedOptionId === plan.id
                              ? '2px solid #086039'
                              : '1px solid #DADADA',
                          backgroundColor:
                            selectedOptionId === plan.id ? '#D6FFE4' : '#FFF',
                          transition: 'border 0.2s',
                          minWidth: '120px',
                          flex: '1 1 100px',

                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between">
                          <Box>
                            <Typography fontWeight={600} mb={1}>
                              {plan.title}
                            </Typography>
                            <Typography variant="body2" color="#666">
                              {plan.subTitle}
                            </Typography>
                            {plan.savings && (
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  color: '#086039',
                                  mt: 0.5,
                                }}
                              >
                                {plan.savings}
                              </Typography>
                            )}
                          </Box>
                          <Stack alignItems="flex-end">
                            <Typography variant="body2" color="#666">
                              From
                            </Typography>
                            <Typography fontWeight={600} color="#086039">
                              ${plan.monthlyEquivalent}
                              /month
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Box>
          <Divider
            sx={{
              mb: 2,
              borderWidth: 1,
              maxWidth: '92%',
              mx: 'auto',
            }}
          />
          <Box sx={{ mb: 3, p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: isMobile ? '1.2rem!important' : '1.4rem!important',
                }}
              >
                Total due after prescribed
              </Typography>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: isMobile ? '1.2rem!important' : '1.4rem!important',
                }}
              >
                ${totalAfterPrescription}
              </Typography>
            </Stack>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2,
                mt: 2,
              }}
            >
              <Chip
                label={`Refills every ${
                  selectedPlan?.medication?.recurring?.interval_count === 1
                    ? 'month'
                    : `${selectedPlan?.medication?.recurring?.interval_count} months`
                }. Cancel anytime.`}
                sx={{
                  bgcolor: 'grey.200',
                  fontWeight: 500,
                  borderRadius: 2,
                  fontSize: isMobile ? '1rem!important' : '1.1rem!important',
                  px: 1.5,
                  py: 0.5,
                }}
              />
            </Box>
            <Divider sx={{ mb: 2, borderWidth: 1, maxWidth: '100%' }} />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: isMobile ? '1.2rem!important' : '1.4rem!important',
                }}
              >
                Due now
              </Typography>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: isMobile ? '1.2rem!important' : '1.4rem!important',
                }}
              >
                ${dueNow.toFixed(2)}
              </Typography>
            </Stack>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: isMobile ? '1rem!important' : '1.1rem!important',
                }}
              >
                You will only be charged if prescribed
              </Typography>
            </Box>
          </Box>
        </Box>
        <PaymentForm
          amount={dueNow}
          buttonText={`Pay $${dueNow.toFixed(2)} now`}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 3,
          }}
        >
          <Check fontSize="small" sx={{ color: '#555' }} />
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color: '#555', ml: '4px' }}
          >
            Cancel anytime. FSA & HSA eligible.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <Typography>Cost of medication is not included.</Typography>
        </Box>
        <TermsOfUse hasAppointment={false} discountApplied={false} />
      </Container>
    );
  }

  if (variationData?.variation_name === 'Variation-2') {
    if (isMobile) {
      return (
        <Container sx={{ mb: 4 }}>
          <Box textAlign="center" mb={2}>
            <Typography variant="h1" sx={{ fontWeight: 600 }}>
              {`Almost done, ${
                patient?.profiles.first_name || 'Almost done!'
              }!`}
            </Typography>
          </Box>
          <Typography
            fontSize="1.1rem"
            color="#086039"
            fontWeight={700}
            textAlign="center"
          >
            Confirm your order and payment details.
          </Typography>
          <Box sx={{ p: 2, borderRadius: 5 }}>
            <Box
              sx={{
                background: '#ECFFF2',
                borderRadius: 5,
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                mb: 3,
              }}
            >
              <Box sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h2" mb={1}>
                  Your plan includes
                </Typography>
                <List>
                  {[
                    'Provider evaluation',
                    'Online check-ins',
                    'Free & discreet shipping',
                    'Convenient preliminary lab testing',
                  ].map((item, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      sx={{ py: 0.3, my: -0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <CheckIcon
                          sx={{
                            color: '#4CAF50',
                            fontSize: '1.3rem',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography fontWeight={600} variant="h3">
                            {item}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {consultation.map((c, index) => (
                  <ListItem
                    key={`consultation-${index}`}
                    disableGutters
                    sx={{ margin: 0 }}
                  >
                    <ListItemText
                      primary={
                        <ConsultationFee
                          consultation={c}
                          updateOrder={setOrder}
                          canRemove={canRemove}
                        />
                      }
                    />
                  </ListItem>
                ))}
                <Stack
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  {selectedPlan && (
                    <ListItem disableGutters sx={{ py: 0.3, my: -0.5 }}>
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <CheckIcon
                          sx={{
                            color: '#4CAF50',
                            fontSize: '1.3rem',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography fontWeight="bold" variant="h3">
                            {selectedPlan.medication.name}
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                  <Box
                    sx={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 5,
                      boxShadow:
                        '0px 1px 6px 0px #00000005, 0px 4px 58px 3px #00000026',
                      p: 2,
                      width: '100%',
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0,
                      }}
                    >
                      <Typography
                        color="#777777"
                        fontWeight={700}
                        fontSize="1rem"
                        maxWidth="120px"
                        textAlign="center"
                        mr={1}
                      >
                        {`${selectedPlan?.medication?.dosage} x ${selectedPlan?.quantity} capsules`}
                      </Typography>
                      <Box
                        sx={{
                          position: 'relative',
                          height: '130px',
                          width: '100px',
                          overflow: 'visible',
                        }}
                      >
                        <Image
                          width={150}
                          height={180}
                          quality={100}
                          priority
                          style={{
                            objectFit: 'contain',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) scale(1.2)',
                          }}
                          alt={medication?.name || ''}
                          src={
                            medication?.image ||
                            getImage() ||
                            enclomipheneBottle
                          }
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '1.2rem',
                        }}
                        mb={2}
                      >
                        Billing Frequency
                      </Typography>
                      <Stack gap={2}>
                        {planOptions.map(plan => (
                          <Paper
                            key={plan.id}
                            onClick={() => handleSelectPlan(plan.id)}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border:
                                selectedOptionId === plan.id
                                  ? '2px solid #086039'
                                  : '1px solid #DADADA',
                              backgroundColor:
                                selectedOptionId === plan.id
                                  ? '#D6FFE4'
                                  : '#FFF',
                              transition: 'border 0.2s',
                              minWidth: '120px',
                              flex: '1 1 100px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box>
                                <Typography fontWeight={600} mb={1}>
                                  {plan.title}
                                </Typography>
                                <Typography variant="body2" color="#666">
                                  {plan.subTitle}
                                </Typography>
                                {plan.savings && (
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{
                                      color: '#086039',
                                      mt: 0.5,
                                    }}
                                  >
                                    {plan.savings}
                                  </Typography>
                                )}
                              </Box>
                              <Stack alignItems="flex-end">
                                <Typography variant="body2" color="#666">
                                  From
                                </Typography>
                                <Typography fontWeight={600} color="#086039">
                                  ${plan.monthlyEquivalent}
                                  /month
                                </Typography>
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>
            <Box
              sx={{
                boxShadow: '0px 4px 14px 3px #0000001C',
                p: 2,
                borderRadius: 5,
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.2rem',
                    }}
                  >
                    Total due after prescribed
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.2rem',
                    }}
                  >
                    ${totalAfterPrescription}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Chip
                    label={`Refills every ${
                      selectedPlan?.medication?.recurring?.interval_count === 1
                        ? 'month'
                        : `${selectedPlan?.medication?.recurring?.interval_count} months`
                    }. Cancel anytime.`}
                    sx={{
                      bgcolor: 'grey.200',
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                    }}
                  />
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.2rem',
                    }}
                  >
                    Due now
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.2rem',
                    }}
                  >
                    ${dueNow.toFixed(2)}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 2,
                  }}
                >
                  <Typography>
                    You will only be charged if prescribed
                  </Typography>
                </Box>
              </Box>

              <PaymentForm
                amount={dueNow}
                buttonText={`Pay $${dueNow.toFixed(2)} now`}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 3,
                }}
              >
                <Check fontSize="small" sx={{ color: '#555' }} />
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{
                    color: '#555',
                    ml: '4px',
                    fontSize: '0.9rem',
                  }}
                >
                  Cancel anytime. FSA & HSA eligible.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 1,
                }}
              >
                <Typography sx={{ fontSize: '0.9rem' }}>
                  Cost of medication is not included.
                </Typography>
              </Box>
            </Box>
          </Box>
          <TermsOfUse
            hasAppointment={false}
            discountApplied={false}
            selectedMedication={selectedPlan?.medication}
          />
        </Container>
      );
    } else {
      return (
        <Container sx={{ mb: 4, mt: 4 }}>
          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            gap={isMobile ? 0 : 4}
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box flex={1}>
              <Box textAlign="left" mb={2}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'Gelasio',
                    fontSize: '3rem!important',
                    mb: 3,
                    letterSpacing: '0.02em',
                  }}
                >
                  {`Almost done, ${patient?.profiles.first_name}!`}
                </Typography>
                <Typography
                  variant="h3"
                  color="#086039"
                  fontWeight={700}
                  mb={0}
                >
                  Confirm your order and payment details.
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: '#ECFFF2',
                  borderRadius: 2,
                  p: 2,
                  mb: isMobile ? 2 : 0,
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gridTemplateRows: 'auto',
                  gap: 2,
                }}
              >
                {selectedPlan && (
                  <Box
                    sx={{
                      gridColumn: '1',
                      gridRow: '1',
                      mt: 4,
                      ml: 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: '120px',
                          height: '120px',
                        }}
                      >
                        <Image
                          width={200}
                          height={200}
                          style={{
                            objectFit: 'contain',
                            position: 'absolute',
                            transform: 'translate(-25%, -20%)',
                          }}
                          alt={medication?.name || ''}
                          src={medication?.image || getImage() || ''}
                        />
                      </Box>
                      <Box ml={4}>
                        <Typography fontWeight="bold" variant="h3">
                          {selectedPlan.medication.name}
                        </Typography>
                        <Typography color="#777777" fontWeight={700}>
                          {`${selectedPlan.medication.dosage} x ${selectedPlan.quantity} capsules`}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography mb={1} fontWeight="bold" variant="h2">
                        Your plan includes
                      </Typography>
                      <List>
                        {[
                          'Provider evaluation',
                          'Online check-ins',
                          'Free & discreet shipping',
                          'Convenient preliminary lab testing',
                        ].map((item, index) => (
                          <ListItem
                            key={index}
                            disableGutters
                            alignItems="flex-start"
                            sx={{
                              py: 0.3,
                              my: -0.5,
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: '30px',
                                mt: '2px',
                              }}
                            >
                              <CheckIcon
                                sx={{
                                  color: '#4CAF50',
                                  fontSize: '1.3rem',
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="h3"
                                  sx={{
                                    fontWeight: 'medium',
                                    lineHeight: '22px',
                                  }}
                                >
                                  {item}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                )}

                <Box
                  sx={{
                    gridColumn: isMobile ? '1' : '2',
                    gridRow: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}
                >
                  {consultation.length > 0 &&
                    consultation.map((c, index) => (
                      <ListItem
                        key={`consultation-${index}`}
                        disableGutters
                        sx={{ my: 1 }}
                      >
                        <ListItemText
                          sx={{ color: '#1B1B1B' }}
                          primary={
                            <ConsultationFee
                              consultation={c}
                              updateOrder={setOrder}
                              canRemove={canRemove}
                            />
                          }
                        />
                      </ListItem>
                    ))}

                  <Box
                    p={2}
                    sx={{
                      border: '1px solid #DADADA',
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <Typography variant="h3" mb={2}>
                      Billing Frequency
                    </Typography>
                    <Stack gap={2}>
                      {planOptions.map(plan => (
                        <Paper
                          key={plan.id}
                          onClick={() => handleSelectPlan(plan.id)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border:
                              selectedOptionId === plan.id
                                ? '2px solid #086039'
                                : '1px solid #DADADA',
                            backgroundColor:
                              selectedOptionId === plan.id ? '#D6FFE4' : '#FFF',
                            transition: 'border 0.2s',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between">
                            <Box>
                              <Typography fontWeight={600}>
                                {plan.title}
                              </Typography>
                              <Typography variant="body2" color="#666">
                                {plan.subTitle}
                              </Typography>
                              {plan.savings && (
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    color: '#086039',
                                    mt: 0.5,
                                  }}
                                >
                                  {plan.savings}
                                </Typography>
                              )}
                            </Box>
                            <Stack alignItems="flex-end">
                              <Typography variant="body2" color="#666">
                                From
                              </Typography>
                              <Typography fontWeight={600} color="#086039">
                                ${plan.monthlyEquivalent}
                                /month
                              </Typography>
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Box>

            {!isMobile && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderRightWidth: 2,
                  borderColor: '#DADADA',
                }}
              />
            )}

            <Box
              sx={{
                width: isMobile ? '100%' : '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Paper
                sx={{
                  border: '1px solid #DADADA',
                  borderRadius: 2,
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
                  p: 2,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h3" fontWeight="bold">
                      Total due after prescribed
                    </Typography>
                    <Box textAlign="right">
                      <Typography variant="h3" fontWeight="bold">
                        {`$${selectedPlan?.price}`}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mt: 2,
                    }}
                  >
                    <Chip
                      label={`Refills every ${
                        selectedPlan?.medication?.recurring?.interval_count ===
                        1
                          ? 'month'
                          : `${selectedPlan?.medication?.recurring?.interval_count} months`
                      }. Cancel anytime.`}
                      sx={{
                        bgcolor: 'grey.200',
                        fontSize: 14,
                        fontWeight: 500,
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                      }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 2, borderBottomWidth: 2 }} />
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h3" fontWeight="bold">
                      Due now
                    </Typography>
                    <Box textAlign="right">
                      {dueNow > 0 ? (
                        <Typography variant="h3" fontWeight="bold">
                          ${dueNow.toFixed(2)}
                        </Typography>
                      ) : (
                        <Typography variant="h3" fontWeight="bold">
                          ${dueNow}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mt: 2,
                    }}
                  >
                    <Typography>
                      You will only be charged if prescribed
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper
                sx={{
                  border: '1px solid #DADADA',
                  borderRadius: 2,
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
                  p: 2,
                  overflow: 'hidden',
                }}
              >
                <PaymentForm
                  amount={dueNow}
                  buttonText={`Pay $${dueNow.toFixed(2)} today`}
                />
              </Paper>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Check fontSize="small" sx={{ color: '#555' }} />
                <Typography
                  fontWeight={700}
                  sx={{
                    color: '#555',
                    ml: '4px',
                    fontSize: '0.9rem',
                  }}
                >
                  Cancel anytime. FSA & HSA eligible.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.9rem' }}>
                  Cost of medication is not included.
                </Typography>
              </Box>
              <Box>
                <TermsOfUse
                  hasAppointment={false}
                  discountApplied={false}
                  selectedMedication={selectedPlan?.medication}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      );
    }
  }

  return <Checkout />;
};

export default EncloCheckout;
