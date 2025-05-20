import Router from 'next/router';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Radio,
  Stack,
  Typography,
  useTheme,
  styled,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Check } from '@mui/icons-material';
import LoopIcon from '@mui/icons-material/Loop';
import Title from '@/components/shared/Title';
import TermsOfUse from '@/components/shared/TermsOfUse';
import { Pathnames } from '@/types/pathnames';
import { useSelector } from '@/components/hooks/useSelector';
import { useCheckoutTitle } from '@/components/hooks/useCheckoutTitle';
import { useCheckoutDescription } from '@/components/hooks/useCheckoutDescription';
import PaymentForm from '../PaymentForm';
import ProviderReviewAlert from '../ProviderReviewAlert';
import Offer from './components/Offer';
import viagra from 'public/images/ed-medications/viagra.png';
import cialis from 'public/images/ed-medications/cialis.png';
import hardie1 from 'public/images/trending/hardie1.png';
import hardie2 from 'public/images/trending/hardie2.png';
import hardie3 from 'public/images/trending/hardie3.png';
import hardie4 from 'public/images/trending/hardie4.png';
import {
  MedicationType,
  OtherOption,
} from '@/context/AppContext/reducers/types/visit';
import { useVisitActions } from '@/components/hooks/useVisit';

import Image from 'next/image';
import { usePatient, useVWOVariationName } from '@/components/hooks/data';
import { useVWO } from '@/context/VWOContext';
import PromoCodeInputV2 from '../../CheckoutV2/asset/PromoCodeInputV2';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { trackWithDeduplication } from '@/utils/freshpaint/utils';

const StrikethroughText = styled(Typography)`
  text-decoration: line-through;
  font-weight: 500;
`;

interface RadioButtonProps {
  setIsVar6399Discount: boolean; // Changed from boolean to setState type
  option: OtherOption;
  basePrice: number;
  onChange: (o: OtherOption) => void;
  isSelected: boolean;
  variation9521?: string | null;
}

interface MedicationNotes {
  displayName: string;
  recurring: {
    interval_count: number;
  };
  quantity: number;
  dosage: string;
  usage?: string;
}

const RadioButton = ({
  option,
  onChange,
  isSelected,
  basePrice,
  variation9521,
}: RadioButtonProps) => {
  const theme = useTheme();
  const onClick = useCallback(() => {
    onChange(option);
  }, [onChange, option]);

  const showBox = useMemo(() => {
    return basePrice !== option.price && isSelected;
  }, [basePrice, isSelected, option.price]);

  return ['Variation-1', 'Variation-2'].includes(variation9521 || '') ? (
    <Stack>
      <Button
        onClick={onClick}
        variant="outlined"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: 0,
          width: '100%',
          minHeight: '85px',
          overflow: 'hidden',
          padding: '10px',
          backgroundColor: isSelected ? 'rgb(222,253,230)' : 'transparent', // Add highlight with opacity
          borderColor: isSelected ? theme.palette.primary.light : 'inherit',
        }}
      >
        <Stack direction="row" alignItems="center">
          <Stack direction="column" sx={{ textAlign: 'left' }}>
            <Typography color="#1b1b1b">Billing {option.label}</Typography>
          </Stack>
        </Stack>
        <Stack direction="row" gap="16px">
          <Stack direction="column" gap="6px" style={{ objectFit: 'contain' }}>
            {option.label !== 'Monthly' &&
            option?.recurring &&
            Math.abs(
              Math.round(
                (basePrice - option.price / option.recurring.interval_count) *
                  12
              )
            ) > 1 ? (
              <Typography
                color={
                  basePrice !== option.price
                    ? theme.palette.primary.light
                    : '#1b1b1b'
                }
                fontWeight={basePrice !== option.price ? 600 : 400}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Save $
                {option?.recurring &&
                  Math.round(
                    (basePrice -
                      option.price / option.recurring.interval_count) *
                      12
                  )}
                /Year
              </Typography>
            ) : null}
            <Typography color={'#1b1b1b'} fontWeight={400}>{`$${
              option?.recurring &&
              Math.round(option.price / option.recurring.interval_count)
            }/mo`}</Typography>
          </Stack>
        </Stack>
      </Button>
    </Stack>
  ) : (
    <Stack>
      <Button
        onClick={onClick}
        variant="outlined"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: 0,
          width: '100%',
          minHeight: '64px',
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" alignItems="center">
          <Radio checked={isSelected} />
          <Typography color="#1b1b1b">{option.label}</Typography>
        </Stack>
        <Stack direction="row" gap="16px">
          {option?.recurring &&
          basePrice !== option.price / option.recurring.interval_count ? (
            <StrikethroughText color="#1b1b1b">{`$${Math.round(
              basePrice
            )}`}</StrikethroughText>
          ) : null}
          <Typography
            color={
              basePrice !== option.price
                ? theme.palette.primary.light
                : '#1b1b1b'
            }
            fontWeight={basePrice !== option.price ? 600 : 400}
          >{`$${
            option?.recurring &&
            Math.round(option.price / option.recurring.interval_count)
          }/mo`}</Typography>
        </Stack>
      </Button>
      {showBox ? (
        <Stack
          alignItems="center"
          bgcolor="#d3d3d3"
          padding="16px"
          borderRadius="8px"
          direction="row"
          gap="8px"
        >
          <LoopIcon />

          <Typography variant="h4" fontWeight="500">{`Pay for and receive a ${
            option?.recurring.interval_count
          }x supply for $${Math.round(option.price)} every ${
            option?.recurring.interval_count
          } months. Cancel any time.`}</Typography>
        </Stack>
      ) : // )
      null}
    </Stack>
  );
};

const EDCheckout = () => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const medication = useSelector(store =>
    store.visit.medications.find(m => m.type === MedicationType.ED)
  );

  const usage = useSelector(store => store.intake.conditions);
  const visitId = useSelector(store => store.visit.id);
  const { updateMedication } = useVisitActions();
  const [frequency, setFrequency] = useState('Every 3 months');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { data: patient } = usePatient();
  const vwoContext = useVWO();
  const { data: var6399 } = useVWOVariationName('6399');
  const isVar6399 =
    var6399?.variation_name === 'Variation-1' ||
    var6399?.variation_name === 'Variation-2';
  const [isVar6399DiscountApplied, setIsVar6399DiscountApplied] =
    useState(false);

  const [variationED5618, setVariationED5618] = useState<string | undefined>();
  const [variation5618, setVariation5618] = useState<string | undefined>();

  const { data: variation8279_6 } = useVWOVariationName('8279_6');

  const activateVariant = async () => {
    // https://app.vwo.com/#/full-stack/server-ab/316/summary
    // A/B Test for ED - Removing discount
    // NV, OH, OR, PA, SC, TN, TX, VA
    if (
      patient?.profiles.first_name &&
      ['NV', 'OH', 'OR', 'PA', 'SC', 'TN', 'TX', 'VA'].includes(
        patient.region as string
      )
    ) {
      const variationName = await vwoContext?.activate('ED5618', patient);
      setVariationED5618(variationName as string);
    }
    // https://app.vwo.com/#/full-stack/server-ab/320/summary
    // A/B Test for ED - Different dosage display
    // WI, AL, KY, MO, NC, NJ, WA, MN,
    if (
      patient?.profiles.first_name &&
      ['WI', 'AL', 'KY', 'MO', 'NC', 'NJ', 'WA', 'MN'].includes(
        patient.region as string
      )
    ) {
      const variationName = await vwoContext?.activate('5618', patient);
      setVariation5618(variationName as string);
    }
  };

  const isHardies = medication?.name?.includes('Hardies');
  const frequencies = useMemo(() => {
    if (
      !medication ||
      !medication.otherOptions ||
      medication.otherOptions.length === 0
    )
      return [];

    if (
      medication.otherOptions[0].discounted_price &&
      medication.otherOptions[0].discounted_price <= 10
    ) {
      return medication.otherOptions.slice(1);
    }

    return medication.otherOptions;
  }, [medication]);

  const basePrice = useMemo(() => {
    if (!medication || !medication.otherOptions) return 0;
    if (medication.price && medication.otherOptions.length === 0)
      return medication.price;
    return (
      medication.otherOptions[0].price /
      medication?.otherOptions[0].recurring?.interval_count
    );
  }, [medication]);

  const title = useCheckoutTitle();
  const description = useCheckoutDescription();

  useEffect(() => {
    activateVariant();
  }, [vwoContext, patient?.profiles.first_name, patient?.region]);

  useEffect(() => {
    trackWithDeduplication('checkout-page');
  }, []);

  useLayoutEffect(() => {
    if (!visitId) {
      Router.push(Pathnames.CARE_SELECTION);
      return;
    }
  }, [visitId]);

  useEffect(() => {
    if (medication) {
      updateMedication({
        type: MedicationType.ED,
        update: {
          note: `Preferred ED medication: ${
            isHardies ? medication?.name : medication.display_name
          }. 
          Preferred ED medication frequency: every ${
            medication?.recurring?.interval_count
          } month(s). 
          Preferred ED medication quantity: ${medication.quantity}
          Preferred ED medication dosage: ${medication?.dosage}.
          Preferred ED medication usage: ${usage}.`,
        },
      });
    }
  }, []);
  const medicationNotes = useCallback(
    (option: OtherOption) => {
      return `Preferred ED medication: ${
        isHardies ? medication?.name : medication?.display_name
      }. 
    Preferred ED medication frequency: every ${
      option.recurring.interval_count
    } month(s). 
    Preferred ED medication quantity: ${option.quantity}
    Preferred ED medication dosage: ${medication?.dosage}.
    Preferred ED medication usage: ${usage}.
    `;
    },
    [isHardies, medication, usage]
  );

  const handleChange = useCallback(
    (f: OtherOption) => {
      setFrequency(f.label);
      updateMedication({
        type: MedicationType.ED,
        update: {
          quantity: f.quantity,
          recurring: f.recurring,
          medication_quantity_id: f.medication_quantity_id,
          price: f.price,
          discounted_price: f.discounted_price,
          note: medicationNotes(f),
        },
      });
    },
    [medicationNotes, updateMedication]
  );

  const saved = useMemo(() => {
    if (!medication || !medication.discounted_price) return 0;
    if (variationED5618 === 'Variation-1') {
      const percent = Math.round(
        (medication.price! /
          (basePrice * medication?.recurring?.interval_count)) *
          100
      );
      return 100 - percent;
    }
    const percent = Math.round(
      (medication.discounted_price! /
        (basePrice * medication?.recurring?.interval_count)) *
        100
    );
    return 100 - percent;
  }, [basePrice, medication, variationED5618, frequency]);

  const price = useMemo(() => {
    if (!medication || !medication?.price) {
      return 0;
    }
    if (variationED5618 === 'Variation-1') {
      return Math.round(medication.price);
    } else {
      if (medication.discounted_price) {
        return Math.round(medication.discounted_price);
      }
      return Math.round(medication.price);
    }
  }, [medication, variationED5618, frequency]);

  const getImage = () => {
    switch (medication?.name) {
      case 'Sildenafil (Generic Viagra)':
      case 'Sildenafil (Generic Viagra), Daily':
        return viagra;
      case 'Tadalafil (Generic Cialis)':
      case 'Tadalafil (Generic Cialis), Daily':
        return cialis;
      case 'Sildenafil + Tadalafil Zealthy Hardies':
        return hardie1;
      case 'Tadalafil + Vardenafil Zealthy Hardies':
        return hardie4;
      case 'Sildenafil + Oxytocin Zealthy Hardies':
        return hardie2;
      case 'Tadalafil + Oxytocin Zealthy Hardies':
        return hardie3;
      default:
        return null;
    }
  };

  const dosageInfo = useMemo(() => {
    switch (medication?.name) {
      case 'Sildenafil + Tadalafil Zealthy Hardies':
        return 'Sildenafil 45mg | Tadalafil 15mg';
      case 'Tadalafil + Vardenafil Zealthy Hardies':
        return 'Tadalafil 75mg | Vardenafil 25mg';
      case 'Sildenafil + Oxytocin Zealthy Hardies':
        return 'Sildenafil 100mg | Oxytocin 100IU';
      case 'Tadalafil + Oxytocin Zealthy Hardies':
        return 'Tadalafil 25mg | Oxytocin 50IU';
    }
  }, [medication]);

  // Invoices are created with discounted price
  // To remove discount, set discounted price to full price
  useEffect(() => {
    if (variationED5618 === 'Variation-1' && medication) {
      updateMedication({
        type: MedicationType.ED,
        update: {
          discounted_price: medication.price,
        },
      });
    } else if (
      medication &&
      medication.price &&
      medication.price !== medication?.discounted_price! + 20
    ) {
      updateMedication({
        type: MedicationType.ED,
        update: {
          discounted_price: medication.price - 20,
        },
      });
    }
  }, [variationED5618, medication?.price, medication?.discounted_price]);

  if (variation8279_6?.variation_name === 'Variation-1') {
    return (
      <Container maxWidth="sm">
        <Box justifyItems={'center'} marginBottom={2} textAlign={'center'}>
          <Typography color={'#8C8C8C'} fontWeight={700}>
            Payment Details
          </Typography>
          <Typography variant="h2">
            {`Almost done, ${patient?.profiles.first_name}!`}
          </Typography>
        </Box>
        <Box textAlign={'center'}>
          <Typography
            color={'#086039'}
            fontWeight={700}
            sx={{ fontSize: '18px !important' }}
          >
            Confirm your order and payment details.
          </Typography>
        </Box>
        <Box
          borderRadius={'12px'}
          p={2.5}
          marginTop={1}
          marginBottom={2}
          boxShadow="0px 4px 58px 3px #00000026"
        >
          <Typography variant="h2" sx={{ fontSize: '30px !important' }}>
            Your plan includes
          </Typography>
          <Chip
            label="$20 off for new members"
            sx={{
              backgroundColor: '#D4F6D4',
              color: '#000',
              fontWeight: 'bold',
              mt: 2,
              mb: 2,
            }}
          />
          <List>
            {[
              'Provider review',
              'Medical adjustments',
              'Ongoing check-ins',
              'Free & discreet shipping',
              `${medication?.name}`,
            ].map((item, index) => (
              <ListItem
                key={index}
                disableGutters
                sx={{ paddingY: 0.3, marginY: 0.5 }}
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
                      fontWeight="550"
                      sx={{
                        fontSize: '20px !important',
                        lineHeight: '20px !important',
                        letterSpacing: '5% !important',
                      }}
                    >
                      {item}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            px={5}
            width="100%"
          >
            <Typography color={'#777777'} fontWeight={700}>
              {`${medication?.dosage} x ${medication?.quantity} doses`}
            </Typography>

            <Image
              width={120}
              height={100}
              objectFit="contain"
              style={{ objectFit: 'contain' }}
              alt={medication?.name || ''}
              src={medication?.image || getImage() || ''}
            />
          </Box>
          <Box
            sx={{
              background:
                'linear-gradient(360deg, rgba(210,235,210,0.6) 0%, rgba(255,255,255,0.95) 100%)',
              borderRadius: 5,
              p: 3,
            }}
          >
            <Box
              sx={{
                background: 'white',
                padding: 2,
                borderRadius: 5,
              }}
            >
              <Stack gap="16px">
                <Typography fontWeight={600} fontSize={16} sx={{ mb: 1 }}>
                  Shipping Out:
                </Typography>
                {frequencies.length > 0 &&
                  frequencies.map(f => (
                    <RadioButton
                      key={f.medication_quantity_id}
                      isSelected={f.label === frequency}
                      onChange={handleChange}
                      option={f}
                      basePrice={basePrice}
                      setIsVar6399Discount={isVar6399DiscountApplied}
                      variation9521={variation8279_6?.variation_name}
                    />
                  ))}
                {frequencies.length === 0 && medication ? (
                  <RadioButton
                    key={medication.medication_quantity_id}
                    isSelected={true}
                    onChange={handleChange}
                    option={{
                      label: 'Monthly',
                      quantity: medication.quantity!,
                      medication_quantity_id:
                        medication.medication_quantity_id!,
                      recurring: medication.recurring,
                      price: medication.price!,
                    }}
                    basePrice={basePrice}
                    setIsVar6399Discount={isVar6399DiscountApplied}
                    variation9521={variation8279_6?.variation_name}
                  />
                ) : null}
              </Stack>
            </Box>
          </Box>
          <Divider sx={{ my: 2, borderBottomWidth: 2 }} />
          <Box
            sx={{
              p: 3,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h3" fontWeight="bold">
                Total due after prescription
              </Typography>
              <Box textAlign="right">
                {medication ? (
                  <Typography
                    variant="h3"
                    sx={{
                      textDecoration: 'line-through',
                      color: 'gray',
                    }}
                  >
                    {`$${Math.round(medication?.price ?? 0)}`}
                  </Typography>
                ) : null}
                {medication ? (
                  <Typography variant="h3" fontWeight="bold">
                    {`$${Math.round(medication?.discounted_price ?? 0)}`}
                  </Typography>
                ) : null}
              </Box>
            </Stack>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
              }}
            >
              {medication ? (
                <Chip
                  label={`Refills every ${
                    medication?.recurring?.interval_count === 1
                      ? 'month'
                      : `${medication?.recurring?.interval_count ?? 3} months`
                  }. Cancel anytime.`}
                  sx={{
                    bgcolor: 'grey.200',
                    fontSize: 14,
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 0.5,
                    py: 0.5,
                  }}
                />
              ) : null}
            </Box>
          </Box>
          <Divider sx={{ my: 2, borderBottomWidth: 2 }} />
          <Box
            sx={{
              p: 3,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h3" fontWeight="bold">
                Due now
              </Typography>
              <Box textAlign="right">
                <Typography variant="h3" fontWeight="bold">
                  $0
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
              <Typography>You will only be charged if prescribed</Typography>
            </Box>
          </Box>
        </Box>
        <PaymentForm amount={0} buttonText="Pay $0 today" />
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
            sx={{ color: '#555', marginLeft: '4px' }}
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
        <TermsOfUse
          hasAppointment={false}
          discountApplied={isVar6399DiscountApplied}
        />
      </Container>
    );
  }

  if (variation8279_6?.variation_name === 'Variation-2') {
    return isMobile ? (
      <Container maxWidth="sm">
        <Box justifyItems={'center'} marginBottom={2}>
          <Typography color={'#8C8C8C'} fontWeight={700}>
            Payment Details
          </Typography>
          <Typography variant="h2">
            {`Almost done, ${patient?.profiles.first_name}!`}
          </Typography>
        </Box>
        <Typography color={'#086039'} fontWeight={700}>
          Confirm your order and payment details.
        </Typography>
        <Box
          borderRadius={5}
          p={2}
          marginTop={1}
          marginBottom={2}
          sx={{ backgroundColor: '#ECFFF2' }}
        >
          <Typography variant="h2">Your plan includes</Typography>
          <List>
            {[
              'Provider review',
              'Medical adjustments',
              'Ongoing check-ins',
              'Free & discreet shipping',
              `${medication?.name}`,
            ].map((item, index) => (
              <ListItem
                key={index}
                disableGutters
                sx={{ paddingY: 0.3, marginY: -0.5 }}
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
                    <Typography fontWeight="bold" variant="body2">
                      {item}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Box
            display={'flex'}
            flexDirection={'column'}
            sx={{
              background: 'linear-gradient(to bottom, white, #ECFFF2)',

              borderRadius: 3,
            }}
          >
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              px={5}
              width="100%"
            >
              <Typography color={'#777777'} fontWeight={700}>
                {`${medication?.dosage} x ${medication?.quantity} doses`}
              </Typography>

              <Image
                width={120}
                height={100}
                objectFit="contain"
                style={{ objectFit: 'contain' }}
                alt={medication?.name || ''}
                src={medication?.image || getImage() || ''}
              />
            </Box>
            <Box
              sx={{
                background: 'white',
                padding: 2,
                borderRadius: 5,
              }}
              mx={3}
              marginBottom={3}
              boxShadow="0px 1px 4px rgba(0,0,0,0.1)"
            >
              <Stack gap="16px">
                <Typography fontWeight={600} fontSize={16} sx={{ mb: 1 }}>
                  Shipping Out:
                </Typography>
                {frequencies.length > 0 &&
                  frequencies.map(f => (
                    <RadioButton
                      key={f.medication_quantity_id}
                      isSelected={f.label === frequency}
                      onChange={handleChange}
                      option={f}
                      basePrice={basePrice}
                      setIsVar6399Discount={isVar6399DiscountApplied}
                      variation9521={variation8279_6?.variation_name}
                    />
                  ))}
                {frequencies.length === 0 && medication ? (
                  <RadioButton
                    key={medication.medication_quantity_id}
                    isSelected={true}
                    onChange={handleChange}
                    option={{
                      label: 'Monthly',
                      quantity: medication.quantity!,
                      medication_quantity_id:
                        medication.medication_quantity_id!,
                      recurring: medication.recurring,
                      price: medication.price!,
                    }}
                    basePrice={basePrice}
                    setIsVar6399Discount={isVar6399DiscountApplied}
                    variation9521={variation8279_6?.variation_name}
                  />
                ) : null}
              </Stack>
              <Chip
                label="Last chance: $20 off today only"
                sx={{
                  backgroundColor: '#D4F6D4',
                  color: '#000',
                  fontWeight: 'bold',
                  mt: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #DADADA',
            boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
            marginBottom: 2,
          }}
        >
          <Box
            sx={{
              p: 2,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h3" fontWeight="bold">
                Total due after prescription
              </Typography>
              <Box textAlign="right">
                {medication ? (
                  <Typography
                    variant="h3"
                    sx={{
                      textDecoration: 'line-through',
                      color: 'gray',
                    }}
                  >
                    {`$${Math.round(medication?.price ?? 0)}`}
                  </Typography>
                ) : null}
                {medication ? (
                  <Typography variant="h3" fontWeight="bold">
                    {`$${Math.round(medication?.discounted_price ?? 0)}`}
                  </Typography>
                ) : null}
              </Box>
            </Stack>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
              }}
            >
              {medication ? (
                <Chip
                  label={`Refills every ${
                    medication?.recurring?.interval_count === 1
                      ? 'month'
                      : `${medication?.recurring?.interval_count ?? 3} months`
                  }. Cancel anytime.`}
                  sx={{
                    bgcolor: 'grey.200',
                    fontSize: 14,
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 0.5,
                    py: 0.5,
                  }}
                />
              ) : null}
            </Box>
          </Box>
          <Divider sx={{ my: 2, borderBottomWidth: 2, mx: 2 }} />
          <Box
            sx={{
              p: 2,
              marginBottom: 2,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h3" fontWeight="bold">
                Due now
              </Typography>
              <Box textAlign="right">
                <Typography variant="h3" fontWeight="bold">
                  $0
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
              <Typography>You will only be charged if prescribed</Typography>
            </Box>
          </Box>
        </Box>
        <PaymentForm amount={0} buttonText="Pay $0 today" />
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
            sx={{ color: '#555', marginLeft: '4px' }}
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
        <TermsOfUse
          hasAppointment={false}
          discountApplied={isVar6399DiscountApplied}
        />
      </Container>
    ) : (
      <Container maxWidth={false} sx={{ maxWidth: '60%' }}>
        <Box display={'flex'} flexDirection={'row'}>
          <Box width={'50%'}>
            <Typography variant="h2">
              {`Almost done, ${patient?.profiles.first_name}!`}
            </Typography>
            <Typography color={'#086039'} fontWeight={700} my={1}>
              Confirm your order and payment details.
            </Typography>
            <Box sx={{ backgroundColor: '#ECFFF2', p: 1 }}>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                width="100%"
              >
                <Image
                  width={80}
                  height={100}
                  objectFit="contain"
                  style={{ objectFit: 'contain' }}
                  alt={medication?.name || ''}
                  src={medication?.image || getImage() || ''}
                />
                <Box display={'flex'} flexDirection={'column'} marginLeft={2}>
                  <Typography
                    variant="h3"
                    fontFamily="serif"
                    fontWeight="bold"
                    color="#1B1B1B"
                  >
                    {medication?.name}
                  </Typography>
                  <Typography color={'#777777'} fontWeight={700}>
                    {`${medication?.dosage} x ${medication?.quantity} doses`}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h3"
                fontFamily="serif"
                fontWeight="bold"
                color="#1B1B1B"
                textAlign={'center'}
                marginBottom={2}
              >
                Your plan includes
              </Typography>
              <Box display={'flex'} flexDirection={'row'}>
                <Box width={'50%'} marginLeft={2}>
                  <List>
                    {[
                      'Provider review',
                      'Medical adjustments',
                      'Ongoing check-ins',
                      'Free & discreet shipping',
                    ].map((item, index) => (
                      <ListItem
                        key={index}
                        disableGutters
                        sx={{
                          paddingY: 0.3,
                          marginY: -0.5,
                        }}
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
                            <Typography variant="body2">{item}</Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box
                  width="50%"
                  sx={{
                    background: 'white',
                    padding: 2,
                    borderRadius: 5,
                  }}
                >
                  <Stack gap="16px">
                    <Typography fontWeight={600} fontSize={16} sx={{ mb: 1 }}>
                      Shipping Out:
                    </Typography>
                    {frequencies.length > 0 &&
                      frequencies.map(f => (
                        <RadioButton
                          key={f.medication_quantity_id}
                          isSelected={f.label === frequency}
                          onChange={handleChange}
                          option={f}
                          basePrice={basePrice}
                          setIsVar6399Discount={isVar6399DiscountApplied}
                          variation9521={variation8279_6?.variation_name}
                        />
                      ))}
                    {frequencies.length === 0 && medication ? (
                      <RadioButton
                        key={medication.medication_quantity_id}
                        isSelected={true}
                        onChange={handleChange}
                        option={{
                          label: 'Monthly',
                          quantity: medication.quantity!,
                          medication_quantity_id:
                            medication.medication_quantity_id!,
                          recurring: medication.recurring,
                          price: medication.price!,
                        }}
                        basePrice={basePrice}
                        setIsVar6399Discount={isVar6399DiscountApplied}
                        variation9521={variation8279_6?.variation_name}
                      />
                    ) : null}
                  </Stack>

                  <Chip
                    label="+$20 off for new members"
                    sx={{
                      backgroundColor: '#D4F6D4',
                      color: '#000',
                      fontWeight: 'bold',
                      mt: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignSelf: 'center',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              backgroundColor: '#D8D8D8',
              width: '1px',
              marginLeft: 10,
              marginRight: 2,
            }}
          />
          <Box display={'flex'} flexDirection={'column'} width={'35%'}>
            <Box
              boxShadow="0px 1px 4px rgba(0,0,0,0.1)"
              borderRadius={2}
              p={1}
              marginTop={1}
              marginBottom={2}
            >
              <Box
                sx={{
                  p: 2,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h5" fontWeight="bold">
                    Total due after prescription
                  </Typography>
                  <Box textAlign="right">
                    {medication ? (
                      <Typography
                        variant="h5"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'gray',
                        }}
                      >
                        {`$${Math.round(medication?.price ?? 0)}`}
                      </Typography>
                    ) : null}
                    {medication ? (
                      <Typography variant="h5" fontWeight="bold">
                        {`$${Math.round(medication?.discounted_price ?? 0)}`}
                      </Typography>
                    ) : null}
                  </Box>
                </Stack>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 2,
                  }}
                >
                  {medication ? (
                    <Chip
                      label={`Refills every ${
                        medication?.recurring?.interval_count === 1
                          ? 'month'
                          : `${
                              medication?.recurring?.interval_count ?? 3
                            } months`
                      }. Cancel anytime.`}
                      sx={{
                        bgcolor: 'grey.200',
                        fontSize: 14,
                        fontWeight: 500,
                        borderRadius: 2,
                        px: 0.5,
                        py: 0.5,
                      }}
                    />
                  ) : null}
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderBottomWidth: 2 }} />
              <Box
                sx={{
                  p: 2,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h5" fontWeight="bold">
                    Due now
                  </Typography>
                  <Box textAlign="right">
                    <Typography variant="h5" fontWeight="bold">
                      $0
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
                  <Typography>
                    You will only be charged if prescribed
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderBottomWidth: 2 }} />
              <Box
                sx={{
                  p: 2,
                }}
              >
                <PaymentForm amount={0} buttonText="Pay $0 today" />
              </Box>
            </Box>
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
                  marginLeft: '4px',
                  fontSize: '0.8rem !important',
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
              <Typography sx={{ fontSize: '0.8rem !important' }}>
                Cost of medication is not included.
              </Typography>
            </Box>
            <Box
              borderRadius={2}
              p={1}
              marginTop={1}
              marginBottom={2}
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              width="100%"
              maxWidth="100%"
              overflow="hidden"
            >
              <TermsOfUse
                hasAppointment={false}
                discountApplied={isVar6399DiscountApplied}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Grid
        container
        gap={{ sm: '25px', xs: '16px' }}
        maxWidth="590px"
        margin="0 auto"
        direction="column"
      >
        <Stack gap={1}>
          <Title text={title} />
          {description && <Typography>{description}</Typography>}
        </Stack>

        <Stack width="inherit" direction="column" gap="16px">
          <ProviderReviewAlert />

          {medication ? (
            <Paper
              sx={{
                padding: '16px 24px',
                borderRadius: '12px',
                background: '#FFF',
                boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
                border: '1px solid #D8D8D8',
              }}
            >
              <Stack gap="16px">
                {isHardies ||
                ((variation5618 === 'Variation-1' ||
                  variationED5618 === 'Variation-1') &&
                  getImage()) ? (
                  <>
                    <Typography variant="h2">Your plan includes:</Typography>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        backgroundColor: '#F6F6F6',
                        borderRadius: '8px',
                        padding: '8px',
                      }}
                    >
                      {variation5618 === 'Variation-1' && isHardies ? (
                        <Stack>
                          <Typography
                            fontWeight={600}
                          >{`${medication.name}`}</Typography>
                          <Typography>{dosageInfo}</Typography>
                          <Typography>{`${
                            medication.quantity! /
                            medication.recurring.interval_count
                          } uses per month`}</Typography>
                        </Stack>
                      ) : (
                        <Stack>
                          <Typography
                            fontWeight={600}
                          >{`${medication.name}`}</Typography>
                          <Typography>{`${medication.dosage} x ${medication.quantity} doses`}</Typography>
                        </Stack>
                      )}
                      <Image
                        width={120}
                        height={100}
                        objectFit="cover"
                        style={{ objectFit: 'cover' }}
                        alt={medication.name}
                        src={medication.image || getImage() || ''}
                      />
                    </Box>
                  </>
                ) : (
                  <Stack>
                    <Typography
                      fontWeight={600}
                    >{`${medication.name}`}</Typography>
                    <Typography>{`${medication.dosage} x ${medication.quantity} doses`}</Typography>
                  </Stack>
                )}
                <Stack gap="16px">
                  <Typography fontWeight={600}>Shipping frequency</Typography>
                  {frequencies.length > 0 &&
                    frequencies.map(f => (
                      <RadioButton
                        key={f.medication_quantity_id}
                        isSelected={f.label === frequency}
                        onChange={handleChange}
                        option={f}
                        basePrice={basePrice}
                        setIsVar6399Discount={isVar6399DiscountApplied}
                      />
                    ))}
                  {frequencies.length === 0 && (
                    <RadioButton
                      key={medication.medication_quantity_id}
                      isSelected={true}
                      onChange={handleChange}
                      option={{
                        label: 'Monthly',
                        quantity: medication.quantity!,
                        medication_quantity_id:
                          medication.medication_quantity_id!,
                        recurring: medication.recurring,
                        price: medication.price!,
                      }}
                      basePrice={basePrice}
                      setIsVar6399Discount={isVar6399DiscountApplied}
                    />
                  )}
                </Stack>
              </Stack>
              <Divider
                sx={{
                  margin: '16px -24px',
                }}
              />
              <Typography color={theme.palette.primary.light}>
                You will only be charged if prescribed
              </Typography>
            </Paper>
          ) : null}

          <Offer
            hasDiscount={
              variationED5618 === 'Variation-1'
                ? false
                : isVar6399 && !isVar6399DiscountApplied
                ? false
                : !!medication?.discounted_price
            }
          />

          <Paper
            sx={{
              padding: '16px 24px',
              borderRadius: '12px',
              background: '#FFF',
              boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
              border: '1px solid #D8D8D8',
            }}
          >
            <Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>{'Total'}</Typography>
                <Stack direction="row" gap="16px">
                  {isVar6399 && !isVar6399DiscountApplied ? (
                    <Typography fontWeight={600}>
                      {' '}
                      ${Math.round(medication?.price ?? 0)}
                    </Typography>
                  ) : isVar6399 && isVar6399DiscountApplied ? (
                    <StrikethroughText fontWeight={600}>
                      {' '}
                      ${Math.round(medication?.price ?? 0)}
                    </StrikethroughText>
                  ) : (!isVar6399 &&
                      variationED5618 === 'Variation-1' &&
                      basePrice !==
                        medication?.price! /
                          medication?.recurring?.interval_count!) ||
                    variationED5618 !== 'Variation-1' ? (
                    <StrikethroughText>
                      $
                      {Math.round(
                        basePrice * medication?.recurring?.interval_count!
                      )}
                    </StrikethroughText>
                  ) : null}
                  {isVar6399 && !isVar6399DiscountApplied ? null : (
                    <Typography fontWeight={600}>{`$${price}`}</Typography>
                  )}
                </Stack>
              </Stack>
              {isVar6399 && !isVar6399DiscountApplied ? null : isVar6399 &&
                isVar6399DiscountApplied ? (
                <Typography
                  alignSelf="flex-end"
                  color={theme.palette.primary.light}
                  fontWeight={600}
                >{`You saved ${saved}%`}</Typography>
              ) : saved !== 0 && medication?.discounted_price ? (
                <Typography
                  alignSelf="flex-end"
                  color={theme.palette.primary.light}
                  fontWeight={600}
                >{`You saved ${saved}%`}</Typography>
              ) : null}
            </Stack>
          </Paper>
          <Paper
            sx={{
              padding: '16px 24px',
              borderRadius: '12px',
              background: '#FFF',
              boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
              border: '1px solid #D8D8D8',
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>{'Due now'}</Typography>
              <Typography fontWeight={600}>$0</Typography>
            </Stack>
          </Paper>
          {isVar6399 ? (
            <PromoCodeInputV2 setIsPromoApplied={setIsVar6399DiscountApplied} />
          ) : null}
        </Stack>
        <PaymentForm amount={0} buttonText="Pay $0 today" />
        <TermsOfUse
          hasAppointment={false}
          discountApplied={isVar6399DiscountApplied}
        />
      </Grid>
    </Container>
  );
};

export default EDCheckout;
