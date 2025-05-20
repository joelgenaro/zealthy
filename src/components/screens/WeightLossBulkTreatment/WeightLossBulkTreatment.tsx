import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  Checkbox,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { compoundCADetails, compoundDetails } from './data';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import {
  MedicationAddOn,
  WeightLossBulkAddOn,
} from '@/components/shared/AddOnPayment';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { usePatient } from '@/components/hooks/data';

type MedObjectProps = {
  name: string;
  type: MedicationType;
  price: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
};

const medData: { [key: string]: MedObjectProps } = {
  Semaglutide: {
    name: 'Semaglutide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 275,
    dosage: '2 mg vial',
    quantity: 1,
    recurring: {
      interval: 'week',
      interval_count: 6,
    },
    medication_quantity_id: 98,
  },
  Tirzepatide: {
    name: 'Tirzepatide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 250,
    dosage: '10 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Liraglutide: {
    name: 'Liraglutide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 375,
    dosage: '50 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
};
const medCAData: { [key: string]: MedObjectProps } = {
  Semaglutide: {
    name: 'Semaglutide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 275,
    dosage: '2.5 mg vial',
    quantity: 1,
    recurring: {
      interval: 'week',
      interval_count: 6,
    },
    medication_quantity_id: 98,
  },
  Tirzepatide: {
    name: 'Tirzepatide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 250,
    dosage: '10 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Liraglutide: {
    name: 'Liraglutide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 375,
    dosage: '50 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
};
const medBulkData: { [key: string]: MedObjectProps } = {
  Semaglutide: {
    name: 'Semaglutide',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 162,
    discounted_price: 130,
    dosage: '10 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Tirzepatide: {
    name: 'Tirzepatide',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 250,
    discounted_price: 199,
    dosage: '30 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Liraglutide: {
    name: 'Liraglutide',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 375,
    discounted_price: 360,
    dosage: '90 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
};
const medCABulkData: { [key: string]: MedObjectProps } = {
  Semaglutide: {
    name: 'Semaglutide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 275,
    discounted_price: 130,
    dosage: '10 mg (3 shipments - 2.5mg, 2.5mg, 5mg)',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    medication_quantity_id: 98,
  },
  Tirzepatide: {
    name: 'Tirzepatide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 250,
    discounted_price: 199,
    dosage: '60 mg (3 shipments - 10mg, 20mg, 30mg)',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Liraglutide: {
    name: 'Liraglutide',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 375,
    discounted_price: 360,
    dosage: '90 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
};
const WeightLossBulkTreatment = () => {
  const { med } = Router.query;
  const { data: patient } = usePatient();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected =
    (med as string)?.slice(0, 1)?.toUpperCase() + med?.slice(1);
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const complete = searchParams?.get('complete');
  const { addMedication } = useVisitActions();
  const [checked, setChecked] = useState<string>('');
  console.log(med);
  console.log(medicationSelected);
  const handleChange = (value: string) => {
    setChecked(value);
  };

  async function handleConfirmMed() {
    setLoading(true);
    Router.push(
      {
        pathname: `/patient-portal/weight-loss-treatment/bulk/${med}`,
        query: { quantity: true },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }

  useEffect(() => {
    if (med) handleConfirmMed();
  }, [med]);

  async function handleConfirmQuantity() {
    if (!!medicationSelected) {
      addMedication(
        checked === 'bulk'
          ? medBulkData[medicationSelected]
          : medData[medicationSelected]
      );
    }

    Router.push(
      {
        pathname: `/patient-portal/weight-loss-treatment/bulk/${med}`,
        query: { med: medicationSelected, review: true },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });

    setLoading(false);
  }

  const listItems = [
    {
      title: 'Provider review: ',
      body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, your payment method will be charged and you will receive your fill shipped to your home.',
    },
    {
      title: 'Check your email and SMS: ',
      body: 'We’ll send you a message if your Provider has any questions or when your refill is ready at your pharmacy.',
    },
    {
      body: 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your refill.',
    },
  ];

  return (
    <Container maxWidth="sm">
      {complete && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {'Your responses are being reviewed!'}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
            {
              'Your Zealthy Provider may reach out to you if they have any additional questions. Here’s what’s next:'
            }
          </Typography>
          <List
            sx={{
              listStyleType: 'disc',
              pl: 3,
              marginBottom: '3rem',
            }}
            disablePadding
          >
            {listItems.map((item, index) => (
              <ListItem key={index} sx={{ display: 'list-item', padding: 0 }}>
                {item.title && <b>{item.title}</b>}
                {item.body}
              </ListItem>
            ))}
          </List>
          <Button
            type="button"
            fullWidth
            onClick={() => Router.push('/patient-portal')}
          >
            Continue
          </Button>
        </Box>
      )}
      {review &&
        (checked === 'single' ? (
          <MedicationAddOn
            onNext={() => {
              Router.push(
                {
                  pathname: `/patient-portal/weight-loss-treatment/bulk/${med}`,
                  query: { complete: true },
                },
                undefined,
                { shallow: true }
              );
              window.scrollTo({ top: 0, left: 0 });
            }}
          />
        ) : (
          <WeightLossBulkAddOn currentMonth={null} />
        ))}
      {medicationSelected && !review && quantity && (
        <Box>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {'Tell us how much medication you’d like to receive.'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {
              'Your coordinator has sent you this link to get started on medication and may have found you Wegovy (covered by your insurance) at the dosage that will be suitable after 6 weeks of Semaglutide.'
            }
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'Additionally, for a limited time, Zealthy is offering a 20% discount on your medication and the next 2 months of your weight loss membership if you get a 3 month supply.'
            }
          </Typography>
          <Box
            sx={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background: '#ffffff',
              boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
              gap: '1.5rem',
              cursor: 'pointer',
            }}
            onClick={() => handleChange('bulk')}
          >
            <Box
              sx={{
                borderRadius: '0.75rem',
                background: '#F7F9A5',
                display: 'flex',
                width: '17rem',
                height: '3.25rem',
                padding: '1rem 1.25rem',
                justifyContent: 'center',
                alignItems: 'flex-start',
                alignSelf: 'center',
                fontWeight: 600,
              }}
            >{`For a limited time save $${compoundDetails[medicationSelected]?.saving}`}</Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Checkbox
                value={checked}
                checked={checked === 'bulk'}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h3" fontWeight="600" mb="0.3rem">
                    {compoundDetails[medicationSelected]?.title}
                  </Typography>
                  <Typography variant="body1" mb="1rem">
                    {`${compoundDetails[medicationSelected]?.name} ${compoundDetails[medicationSelected]?.dosage}`}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="1rem !important"
                >
                  <Typography
                    component="span"
                    variant="body1"
                    fontSize="1rem !important"
                    sx={{
                      textDecoration: 'line-through',
                      marginRight: '0.2rem',
                      width: '20px',
                    }}
                  >
                    {`$${compoundDetails[medicationSelected]?.price}/month`}
                  </Typography>
                  {`$${compoundDetails[medicationSelected]?.discountedPrice}/month for ${compoundDetails[medicationSelected]?.name} (3 month supply)`}
                </Typography>
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="0.75rem !important"
                >
                  {compoundDetails[medicationSelected]?.body1}
                </Typography>
                <Typography variant="body1" fontSize="0.75rem !important">
                  {compoundDetails[medicationSelected]?.body2}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background: '#ffffff',
              boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '3rem',
              gap: '1.5rem',
              cursor: 'pointer',
            }}
            onClick={() => handleChange('single')}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Checkbox
                value={checked}
                checked={checked === 'single'}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h3" fontWeight="600" mb="0.3rem">
                    {compoundDetails[medicationSelected].singleTitle}
                  </Typography>
                  <Typography variant="body1" mb="1rem">
                    {`${compoundDetails[medicationSelected].name} ${compoundDetails[medicationSelected].singleDosage}`}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="1rem !important"
                >
                  {`$${compoundDetails[medicationSelected]?.sixWeekPrice} for your first 6 weeks of ${compoundDetails[medicationSelected].name}`}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button fullWidth onClick={handleConfirmQuantity}>
            Continue
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default WeightLossBulkTreatment;
