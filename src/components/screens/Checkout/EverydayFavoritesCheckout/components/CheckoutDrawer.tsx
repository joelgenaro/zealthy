import Image from 'next/image';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import PatientPaymentMethod from '@/components/shared/PatientPaymentMethod';
import {
  usePatient,
  usePatientAddress,
  usePatientDefaultPayment,
} from '@/components/hooks/data';
import { IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import PaymentEditModal from '@/components/shared/PaymentEditModal';
import { useCallback, useState } from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import axios from 'axios';
import toast from 'react-hot-toast';
import Router from 'next/router';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  medication: Medication;
  page: string;
  setPage: (p: string) => void;
}

const CheckoutDrawer = ({
  open,
  medication,
  onClose,
  page,
  setPage,
}: DrawerProps) => {
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { data: patientAddress } = usePatientAddress();
  const { data: patient } = usePatient();
  const isMobile = useIsMobile();
  const [openPaymentEdit, setOpenPaymentEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleBuyNow = useCallback(async () => {
    try {
      setLoading(true);
      await axios
        .post('/api/buy_now/purchase-medication-now', {
          patient,
          patientAddress,
          medication,
        })
        .then(() => {
          toast.success('Order was successfully submitted');
          setLoading(false);
          Router.push('/patient-portal/visit/discover-care');
        });
    } catch (err) {
      toast.error('Unable to process order, please try again');
      setLoading(false);
      console.log('ERROR:', err);
    }
  }, [medication, patient, patientAddress]);

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        sx={{
          '.MuiDrawer-paper': {
            width: '100%',
            maxWidth: '600px',
            background: 'transparent',
            margin: '0 auto',
            left: '0',
            right: '0',
            transform: isMobile ? '' : 'translateX(-50%, -50%)',
          },
        }}
      >
        <Stack>
          <Box
            display="flex"
            sx={{
              gap: '1rem',
              padding: '15px',
              alignItems: 'center',
              background: '#F7F9F8',
              borderRadius: '12px',
              boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(180deg, #FEFEFE 0%, #88C29C 100%)',
                width: 'fit-content',
                borderRadius: '5px',
                padding: '10px',
              }}
            >
              <Image
                alt={medication.name}
                src={medication.image!}
                width={95}
                height={90}
              />
            </Box>
            <Box>
              <Typography variant="h3" fontSize="1.1rem!important">
                {medication.name}
              </Typography>
              <Typography>{`$${medication.price}`}</Typography>
            </Box>
          </Box>
          <Box style={{ height: '0.3rem', background: 'transparent' }} />
          <Box
            sx={{
              background: '#F7F9F8',
              borderRadius: '0 0 12px 12px',
              padding: '20px',
              boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              position="relative"
            >
              <Typography
                fontWeight={700}
                sx={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                Checkout
              </Typography>
              <Icon
                sx={{
                  position: 'absolute',
                  right: 0,
                  cursor: 'pointer',
                }}
                onClick={onClose}
              >
                <CloseIcon />
              </Icon>
            </Box>
            <br />
            <br />
            <Box display="flex" flexDirection="column" sx={{ gap: '2rem' }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={700}>Shipping Address</Typography>
                <Box display="flex" sx={{ gap: '1rem' }}>
                  <Typography sx={{ width: '180px' }}>{`${
                    patientAddress?.address_line_1
                  }, ${
                    patientAddress?.address_line_2 &&
                    patientAddress.address_line_2 + ','
                  } ${patientAddress?.city}, ${
                    patientAddress?.state
                  }`}</Typography>

                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                    onClick={() => {
                      setPage('delivery-address');
                    }}
                  >
                    <ChevronRight fontSize={'medium'} />
                  </IconButton>
                </Box>
              </Box>
              <hr
                style={{
                  borderTop: '0.5px solid ##D6D6D6',
                  width: '98%',
                  position: 'relative',
                  bottom: '6px',
                }}
              />
              {paymentMethod ? (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight={700}>Payment method</Typography>
                  <Box display="flex" sx={{ gap: '1rem' }}>
                    <PatientPaymentMethod paymentMethod={paymentMethod} />
                    <IconButton
                      sx={{
                        color: '#777777',
                        padding: '0',
                      }}
                      edge="start"
                      onClick={() => setOpenPaymentEdit(o => !o)}
                    >
                      <ChevronRight fontSize={'medium'} />
                    </IconButton>
                  </Box>
                </Box>
              ) : null}
              <hr
                style={{
                  borderTop: '0.5px solid ##D6D6D6',
                  width: '98%',
                  position: 'relative',
                  bottom: '6px',
                }}
              />
              <Stack gap="0.5rem">
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>Subtotal</Typography>
                  <Typography>{`$${medication.price}`}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>Sales Tax</Typography>
                  <Typography>$0.00</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography>{`$${medication.price}`}</Typography>
                </Box>
              </Stack>
            </Box>
            <br />
            <LoadingButton
              disabled={!medication || loading}
              loading={loading}
              fullWidth
              onClick={handleBuyNow}
            >
              Place Order - ${medication.price}
            </LoadingButton>
          </Box>
        </Stack>
        <PaymentEditModal
          open={openPaymentEdit}
          title="Update your card to get your care or prescription"
          onClose={() => setOpenPaymentEdit(o => !o)}
        />
      </Drawer>
    </>
  );
};

export default CheckoutDrawer;
