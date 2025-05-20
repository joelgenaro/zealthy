import Router from 'next/router';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { Check } from '@mui/icons-material';
import TermsOfUse from '@/components/shared/TermsOfUse';
import AppointmentCard from '../AppointmentCard';
import PaymentForm from '../PaymentForm';
import ConsultationFee from '../ConsultationFee';
import { Order } from '../../types';
import { Pathnames } from '@/types/pathnames';
import { useSelector } from '@/components/hooks/useSelector';
import { useTotalDiscount } from '@/components/hooks/useTotalDiscount';
import { useCanRemove } from '@/components/hooks/useCanRemove';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePatient, useVWOVariationName } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import Loading from '@/components/shared/Loading/Loading';
import Checkout from '../..';
import CheckoutPopUpModalGLP1 from '@/components/screens/GLP1Treatment/GLP1ChcekoutPopUp';
import { trackWithDeduplication } from '@/utils/freshpaint/utils';

interface BulletItem {
  text: string | JSX.Element;
  icon: JSX.Element;
}

const boldText = (text: string) => {
  const colonIndex = text.indexOf(':');
  if (colonIndex === -1) return text;
  return (
    <>
      <span style={{ fontWeight: 700 }}>{text.slice(0, colonIndex + 1)}</span>
      {text.slice(colonIndex + 1)}
    </>
  );
};

// Define common bullet points to be used in both variations.
const commonBulletPoints: BulletItem[] = [
  {
    text: (
      <>
        {boldText('Initial Consultation:')}
        {
          ' Phone or video visit, including a diagnosis if appropriate, with a Zealthy mental health provider.'
        }
      </>
    ),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#149E42"
      >
        <path d="M540-80q-108 0-184-76t-76-184v-23q-86-14-143-80.5T80-600v-240h120v-40h80v160h-80v-40h-40v160q0 66 47 113t113 47q66 0 113-47t47-113v-160h-40v40h-80v-160h80v40h120v240q0 90-57 156.5T360-363v23q0 75 52.5 127.5T540-160q75 0 127.5-52.5T720-340v-67q-35-12-57.5-43T640-520q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 70T800-407v67q0 108-76 184T540-80Z" />
      </svg>
    ),
  },
  {
    text: (
      <>
        {boldText('Prescription Service:')}
        {
          ' Rx sent directly to your home, included with your membership, or delivered to your preferred pharmacy at no additional cost.'
        }
      </>
    ),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#149E42"
      >
        <path d="M345-120q-94 0-159.5-65.5T120-345q0-45 17-86t49-73l270-270q32-32 73-49t86-17q94 0 159.5 65.5T840-615q0 45-17 86t-49 73L504-186q-32 32-73 49t-86 17Zm266-286 107-106q20-20 31-47t11-56q0-60-42.5-102.5T615-760q-29 0-56 11t-47 31L406-611l205 205ZM345-200q29 0 56-11t47-31l106-107-205-205-107 106q-20 20-31 47t-11 56q0 60 42.5 102.5T345-200Z" />
      </svg>
    ),
  },
  {
    text: (
      <>
        {boldText('Follow-Up Visits:')}
        {
          ' Additional video or phone visits with your Zealthy mental health provider.'
        }
      </>
    ),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#149E42"
      >
        <path d="M320-600v-80h320v80H320ZM280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v720q0 33-23.5 56.5T680-40H280Zm0-120v40h400v-40H280Zm0-80h400v-480H280v480Zm0-560h400v-40H280v40Zm0 0v-40 40Zm0 640v40-40Z" />
      </svg>
    ),
  },
  {
    text: (
      <>
        {boldText('Messaging Support:')}
        {
          ' Unlimited messaging with your care coordinator and mental health provider.'
        }
      </>
    ),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#149E42"
      >
        <path d="M880-80 720-240H320q-33 0-56.5-23.5T240-320v-40h440q33 0 56.5-23.5T760-440v-280h40q33 0 56.5 23.5T880-640v560ZM160-473l47-47h393v-280H160v327ZM80-280v-520q0-33 23.5-56.5T160-880h440q33 0 56.5 23.5T680-800v280q0 33-23.5 56.5T600-440H240L80-280Zm80-240v-280 280Z" />
      </svg>
    ),
  },
];

const BulletList = ({ items }: { items: BulletItem[] }) => (
  <List>
    {items.map(({ text, icon }, index) => (
      <ListItem key={index} disableGutters sx={{ py: 0.3, my: -0.5 }}>
        <ListItemIcon sx={{ minWidth: '30px' }}>{icon}</ListItemIcon>
        <ListItemText
          primary={<Typography variant="body2">{text}</Typography>}
        />
      </ListItem>
    ))}
  </List>
);

const AppointmentSection = ({ appointment }: { appointment: any }) => (
  <>
    <Typography
      color="#086039"
      sx={{
        fontWeight: 700,
        fontSize: '18px!important',
        lineHeight: '22px!important',
        marginBottom: 2,
      }}
    >
      Your upcoming appointment details:
    </Typography>
    <Box sx={{ boxShadow: '0px 1px 4px rgba(0,0,0,0.1)', borderRadius: 5 }}>
      {appointment ? (
        <AppointmentCard appointment={appointment} />
      ) : (
        <Box p={2}>
          <Typography>[No appointment scheduled at this time.]</Typography>
        </Box>
      )}
    </Box>
  </>
);

const PsychCheckout = () => {
  const [order, setOrder] = useState<Order>({
    subscriptions: [],
    visit: null,
    medications: [],
    coaching: [],
    consultation: [],
  });
  const isMobile = useIsMobile();
  const appointment = useSelector(store =>
    store.appointment.find(a => a.appointment_type === 'Provider')
  );
  const visitId = useSelector(store => store.visit.id);
  const consultation = useSelector(store => store.consultation);
  const { data: patient } = usePatient();
  const canRemove = useCanRemove(order);
  const discount = useTotalDiscount();
  const { specificCare } = useIntakeState();
  const [totalAmount, setTotalAmount] = useState(39);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: variationData, isLoading } = useVWOVariationName('7865_2');

  useEffect(() => {
    trackWithDeduplication('checkout-page');
  }, [order]);

  useLayoutEffect(() => {
    if (!visitId) {
      Router.push(Pathnames.CARE_SELECTION);
    }
  }, [visitId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsModalOpen(true), 300000);
    return () => clearTimeout(timer);
  }, []);

  const handleModalClose = () => setIsModalOpen(false);

  if (isLoading || !variationData) return <Loading />;

  // Render for Variation-1
  const renderVariation1 = () => (
    <Container maxWidth="sm">
      <Box mb={2} textAlign="center">
        <Typography color="#8C8C8C" fontWeight={700} mb={1}>
          Payment Details
        </Typography>
        <Typography variant="h2">
          {`Almost done, ${patient?.profiles.first_name || ''}!` ||
            'Almost done!'}
        </Typography>
      </Box>

      <AppointmentSection appointment={appointment} />

      <Box my={2} p={3} borderRadius={5} border="1px solid rgb(207,205,205)">
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            fontSize: '32px!important',
            fontStyle: 'Gelasio',
            mt: 1,
            mb: 1,
          }}
        >
          Your plan includes
        </Typography>
        <BulletList items={commonBulletPoints}></BulletList>
        {consultation.length > 0 &&
          consultation.map(c => (
            <ConsultationFee
              key={c.type}
              consultation={c}
              updateOrder={setOrder}
              canRemove={canRemove}
            />
          ))}
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
              p: 2,
              borderRadius: 5,
              display: 'flex',
              gap: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              flexGrow: 1,
            }}
          >
            <Typography
              fontWeight={500}
              fontStyle="inter"
              sx={{
                mb: 1,
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                fontSize: isMobile ? '1rem!important' : '1.2rem!important',
              }}
            >
              Zealthy Personalized Psychiatry
            </Typography>
            <Typography
              display="flex"
              justifyContent="center"
              alignItems="center"
              fontWeight={700}
              color="#367A35"
              fontSize={isMobile ? '1rem!important' : '1.2rem!important'}
              fontStyle="inter"
              sx={{ mb: 1 }}
            >
              {`$${totalAmount + discount}/mo`}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2, borderBottomWidth: 2 }} />
        <Box
          sx={{
            borderRadius: 5,
            boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
            p: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#F9F9F9',
              borderRadius: 5,
              p: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    letterSpacing: '0.8px',
                    fontSize: isMobile ? '1rem!important' : '1.2rem!important',
                  }}
                >
                  TODAY’S TOTAL
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography
                  variant={isMobile ? 'h2' : 'h3'}
                  sx={{
                    textDecoration: 'line-through',
                    color: 'gray',
                    display: 'block',

                    mb: 0.5,
                  }}
                >
                  {`$${totalAmount + discount}`}
                </Typography>
                <Typography
                  variant={isMobile ? 'h2' : 'h3'}
                  sx={{ fontWeight: 700, color: '#333' }}
                >
                  {`$${totalAmount}`}
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
                label="Cancel anytime."
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
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <PaymentForm
          amount={totalAmount}
          buttonText={`Pay $${totalAmount} today`}
        />
      </Box>

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
          sx={{ color: '#555', ml: '4px', fontSize: '0.9rem' }}
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
          Cost of medication is included in your membership.
        </Typography>
      </Box>
      <TermsOfUse hasAppointment={!!appointment} discountApplied={false} />
      <CheckoutPopUpModalGLP1 open={isModalOpen} onClose={handleModalClose} />
    </Container>
  );

  // Render for Variation-2
  const renderVariation2 = () => (
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={4}
        justifyContent="space-between"
      >
        {/* LEFT COLUMN */}
        <Box flex={1}>
          <Box mb={2}>
            <Typography variant="h1" sx={{ fontWeight: 600 }}>
              {`Almost done, ${patient?.profiles.first_name || ''}!` ||
                'Almost done!'}
            </Typography>
            <Typography color="#086039" variant="h3" fontWeight={700} mt={1}>
              Confirm your order and payment details.
            </Typography>
          </Box>
          <Box
            borderRadius={2}
            p={3}
            mb={3}
            sx={{ backgroundColor: '#ECFFF2' }}
          >
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              width="100%"
              alignItems="center"
            >
              <Box
                display="flex"
                flexDirection="column"
                width={isMobile ? '100%' : '60%'}
              >
                <Typography variant="h3">Your plan includes</Typography>
                <BulletList items={commonBulletPoints} />
                {consultation.length > 0 &&
                  consultation.map(c => (
                    <ConsultationFee
                      key={c.type}
                      consultation={c}
                      updateOrder={setOrder}
                      canRemove={canRemove}
                    />
                  ))}
              </Box>
              <Box
                width={isMobile ? '100%' : '40%'}
                display="flex"
                flexDirection="column"
                flexWrap={isMobile ? 'nowrap' : 'wrap'}
                justifyContent={isMobile ? 'center' : 'space-evenly'}
                alignItems="center"
              >
                <Box
                  sx={{
                    backgroundColor: 'white',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '90%',
                    height: isMobile ? '100px' : '200px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                    mt: 2,
                    boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography
                    fontWeight={700}
                    color="#367A35"
                    fontSize="24px!important"
                  >
                    {`$${totalAmount + discount}/mo`}
                  </Typography>
                  <br />
                  <Typography
                    fontWeight={500}
                    fontSize="16px!important"
                    sx={{
                      textAlign: 'center',
                      overflowWrap: 'normal',
                      fontSize: '18px !important',
                      lineHeight: '22px !important',
                    }}
                  >
                    Zealthy Personalized Psychiatry
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <AppointmentSection appointment={appointment} />
        </Box>
        {/* RIGHT COLUMN */}
        <Box
          width={{ xs: '100%', md: '400px' }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box
            sx={{
              border: '1px solid #DADADA',
              borderRadius: 2,
              boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
              mb: 2,
              p: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#F9F9F9',
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Stack
                direction="row"
                alignItems="baseline"
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: '#666',
                      fontWeight: 600,
                      letterSpacing: '0.8px',
                    }}
                  >
                    TODAY’S TOTAL
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography
                    variant={isMobile ? 'h2' : 'h3'}
                    sx={{
                      textDecoration: 'line-through',
                      color: 'gray',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {`$${totalAmount + discount}`}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'h2' : 'h3'}
                    sx={{ fontWeight: 700, color: '#333' }}
                  >
                    {`$${totalAmount}`}
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
                  label="Cancel anytime."
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
            <Divider sx={{ my: 1, borderBottomWidth: 2 }} />
            <Box p={2}>
              <PaymentForm
                amount={totalAmount}
                buttonText={`Pay $${totalAmount} today`}
              />
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt={2}
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
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={1}
          >
            <Typography sx={{ fontSize: '0.9rem' }}>
              Cost of medication is included in your membership.
            </Typography>
          </Box>
          <Box mt={2}>
            <TermsOfUse
              hasAppointment={!!appointment}
              discountApplied={false}
            />
          </Box>
          <CheckoutPopUpModalGLP1
            open={isModalOpen}
            onClose={handleModalClose}
          />
        </Box>
      </Box>
    </Container>
  );

  return variationData?.variation_name === 'Variation-1' ? (
    renderVariation1()
  ) : variationData?.variation_name === 'Variation-2' ? (
    renderVariation2()
  ) : (
    <Checkout />
  );
};

export default PsychCheckout;
