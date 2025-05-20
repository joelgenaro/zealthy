import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Checkbox,
  Divider,
  IconButton,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { usePatientAddress } from '@/components/hooks/data';
import PaymentForm from '../PaymentForm/PaymentForm';
import { usePatientLabWorks } from '@/components/hooks/data';

const PrepCheckout = () => {
  const { data: address } = usePatientAddress();
  const { data: labWorks } = usePatientLabWorks();
  const [expandedPrEP, setExpandedPrEP] = useState(true);
  const [expandedPayLater, setExpandedPayLater] = useState(true);
  const [isCheckedTestingKit, setIsCheckedTestingKit] = useState(false);
  const labWorksLength = labWorks?.length || 0;

  useEffect(() => {
    if (labWorksLength === 0) setIsCheckedTestingKit(true);
    else setIsCheckedTestingKit(false);
  }, [labWorksLength]);

  const handleCheckboxChange = () => {
    if (labWorksLength === 0) return;
    setIsCheckedTestingKit(prev => !prev);
  };

  const handleExpandPrEP = () => {
    setExpandedPrEP(prev => !prev);
  };

  const handleExpandPayLater = () => {
    setExpandedPayLater(prev => !prev);
  };

  const formattedAddress = useMemo(() => {
    return `
    ${address?.address_line_1.trim()}, 
    ${address?.city.trim()}, 
    ${address?.state.trim()}, 
    ${address?.zip_code.trim()}
  `.replace(/\s+/g, ' ');
  }, [address]);

  const totalCost = useMemo(() => {
    return isCheckedTestingKit ? 105 + 94 : 105;
  }, [isCheckedTestingKit]);

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h2"
        sx={{
          fontWeight: 700,
          marginBottom: 2,
          fontFamily: 'Gelasio, serif',
        }}
      >
        Order Summary
      </Typography>

      <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 700 }}>
        How would you like to pay for your medication?
      </Typography>

      <Box display="flex" flex={4} flexDirection={'row'}>
        <Box
          bgcolor={'#DCF2E3'}
          sx={{ borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}
          padding={2}
        >
          <Box>
            <Checkbox
              sx={{ borderColor: 'green' }}
              checked={isCheckedTestingKit}
              onChange={handleCheckboxChange}
              disabled={labWorksLength === 0}
            />
          </Box>
          <Box marginX={2} marginTop={3.5}>
            <svg
              width="130"
              height="20"
              viewBox="0 0 117 15"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.10352 0.683594H13.623V3.54492L5.5957 11.9238H13.916V15H0.332031V12.0312L8.27148 3.74023H1.10352V0.683594ZM17.9082 0.683594H29.7637V3.74023H22.3418V6.01562H29.2266V8.93555H22.3418V11.7578H29.9785V15H17.9082V0.683594ZM43.1797 12.6367H38.1406L37.4473 15H32.9258L38.3066 0.683594H43.1309L48.5117 15H43.8828L43.1797 12.6367ZM42.252 9.54102L40.6699 4.39453L39.0977 9.54102H42.252ZM51.9375 0.683594H56.3613V11.4746H63.2656V15H51.9375V0.683594ZM66.2715 0.683594H79.7188V4.21875H75.207V15H70.7832V4.21875H66.2715V0.683594ZM83.75 0.683594H88.1738V5.69336H93.0078V0.683594H97.4512V15H93.0078V9.20898H88.1738V15H83.75V0.683594ZM100.945 0.683594H105.857L108.748 5.51758L111.639 0.683594H116.521L110.955 9.00391V15H106.521V9.00391L100.945 0.683594Z"
                fill="currentColor"
              />
            </svg>
          </Box>
        </Box>
        <Box
          bgcolor={'#F5F2F2'}
          padding={4}
          sx={{
            borderBottomRightRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Typography sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            Basic Home Testing Kit
          </Typography>
          <Typography sx={{ marginBottom: 2 }}>
            All you need for PrEP. The kit tests for HIV, creatinine, pregnancy,
            hepatitis B, and hepatitis C.
          </Typography>
          <Typography sx={{ fontWeight: 'bold' }}>$94</Typography>
        </Box>
      </Box>

      <Box sx={{ marginY: 4 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Ship to
          </Typography>
          <Typography variant="body2">{formattedAddress}</Typography>
        </Box>
      </Box>

      <Divider sx={{ marginY: 2 }} textAlign="center">
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Pay now
        </Typography>
      </Divider>

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <IconButton sx={{ paddingX: 0 }} onClick={handleExpandPrEP}>
          {expandedPrEP ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Box
          display="flex"
          width="100%"
          justifyContent="space-between"
          sx={{ flexGrow: 1, marginLeft: 1 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            PrEP
          </Typography>
          <Typography
            variant="body2"
            textAlign="right"
            sx={{ fontWeight: 'bold' }}
          >
            TBD
          </Typography>
        </Box>
      </Box>
      <Collapse in={expandedPrEP}>
        <Box sx={{ paddingX: 0 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ marginBottom: 0.5 }}
          >
            <Typography variant="body2">Prescription</Typography>
            <Typography variant="body2">TBD</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Support Fee</Typography>
            <Typography variant="body2">$5.00</Typography>
          </Box>
        </Box>
      </Collapse>

      <Box display="flex" alignItems="center">
        <IconButton sx={{ paddingX: 0 }} onClick={handleExpandPayLater}>
          {expandedPayLater ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Box
          display="flex"
          width="100%"
          justifyContent="space-between"
          sx={{ flexGrow: 1, marginLeft: 1 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            PrEP
          </Typography>
          <Typography
            variant="body2"
            textAlign="right"
            sx={{ fontWeight: 'bold' }}
          >
            {`$${totalCost - 5}.00`}
          </Typography>
        </Box>
      </Box>
      <Collapse in={expandedPayLater} sx={{ padding: 0 }}>
        <Box sx={{ padding: 0 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ marginBottom: 0.5 }}
          >
            <Typography variant="body2">Medical Consultation</Typography>
            <Typography variant="body2">$100.00</Typography>
          </Box>
          {isCheckedTestingKit && (
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Lab Testing</Typography>
              <Typography variant="body2">$94.00</Typography>
            </Box>
          )}
        </Box>
      </Collapse>

      <Divider sx={{ marginY: 2 }} textAlign="center">
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Pay later
        </Typography>
      </Divider>
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{ marginBottom: 2, marginTop: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          Shipping
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          FREE
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
          Due Today
        </Typography>
        <Typography variant="h3">{`$${totalCost}.00`}</Typography>
      </Box>

      <Box sx={{ marginTop: 4 }}>
        <PaymentForm amount={totalCost} />
      </Box>
    </Container>
  );
};

export default PrepCheckout;
