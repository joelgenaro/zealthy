import {
  usePatient,
  usePatientOrders,
  usePatientPayment,
} from '@/components/hooks/data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  switchToSemaglutideEvent,
  tirzepatideFullRefundEvent,
} from '@/utils/freshpaint/events';
import { Box, Button, Container, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

const SwitchPrescription = () => {
  const { data: orders } = usePatientOrders();
  const { data: patientInfo } = usePatient();
  const { data: patientPayment, refetch: refetchPatientPayment } =
    usePatientPayment();
  const [disableButton, setDisableButton] = useState(false);

  const tirzepatideOrders = orders?.filter(
    order =>
      ['tirzepatide'].includes(
        order?.prescription?.medication?.split(' ')[0].toLowerCase() || ''
      ) &&
      order?.amount_paid !== 0 &&
      order?.amount_paid !== null &&
      order?.order_status !== 'CANCELED'
  );

  const regex = /(\d+(\.\d+)?)/;
  const tirzepatideDosage =
    tirzepatideOrders?.[0]?.prescription?.medication?.match(regex);

  let dosageConversions: string;
  let totalDose: string;

  switch (tirzepatideDosage?.[1]) {
    case '2.5':
      dosageConversions = '0.25';
      totalDose = '1';
      break;
    case '5':
      dosageConversions = '0.5';
      totalDose = '2';
      break;
    case '7.5':
      dosageConversions = '1';
      totalDose = '5';
      break;
    case '10':
      dosageConversions = '1.7';
      totalDose = '6';
      break;
    case '12.5':
      dosageConversions = '1.7';
      totalDose = '10';
      break;
    case '15':
      dosageConversions = '2.4';
      totalDose = '12';
      break;
    default:
      dosageConversions = '0.25';
      totalDose = '1';
      break;
  }

  const newOrderDosageObject = {
    dose: dosageConversions,
    total_dose: totalDose,
  };

  const percentageAmount = (
    ((tirzepatideOrders?.[0]?.amount_paid ?? 0) * 35) /
    100
  ).toFixed(2);

  const handleFullRefund = async (orderId: any) => {
    await axios.post('/api/stripe/utils/charge/tirzepatide-refund-issued', {
      orderId,
      patientId: patientInfo?.id,
      stripeCustomerId: patientPayment?.customer_id,
    });
    await tirzepatideFullRefundEvent(
      patientInfo?.profiles?.email || '',
      patientInfo?.profiles?.first_name || ''
    );
    toast.success('Full refund successfully issued');
    Router.push(Pathnames.PATIENT_PORTAL);
  };

  const handleSwitchToSemaglutide = async (orderId: any) => {
    setDisableButton(true);
    try {
      await axios.post('/api/stripe/utils/charge/switched-to-semaglutide', {
        orderId,
        patientId: patientInfo?.id,
        order: tirzepatideOrders?.[0],
        newOrderInfo: newOrderDosageObject,
        stripeCustomerId: patientPayment?.customer_id,
      });

      await switchToSemaglutideEvent(
        patientInfo?.profiles?.email || '',
        patientInfo?.profiles?.first_name || '',
        Number(percentageAmount)
      );

      toast.success('Successfully switched to semaglutide');
      Router.push(Pathnames.PATIENT_PORTAL);
    } catch (error) {
      console.error('Error in switching to semaglutide:', error);
      toast.error('Failed to switch to semaglutide');
    } finally {
      setDisableButton(false);
    }
  };

  return (
    <Container>
      <>
        <Typography component="h3" variant="h3">
          We are unable to ship tirzepatide to California at this time due to a
          change with our partner pharmacy outside of Zealthy’s control.
        </Typography>
        <br></br>
        <Typography component="h3" variant="h3">
          You can receive semaglutide instead and get a 35% refund, or cancel
          your order entirely and get a full medication refund.
        </Typography>
        <br></br>
        <Typography variant="body1">
          {`We can offer you the equivalent dosage of semaglutide. Since you
          ordered a 1 month supply of tirzepatide (${
            tirzepatideDosage?.[1]
          } mg vial), you would
          receive a 1 month supply of semaglutide (${dosageConversions} mg vial). If you choose
          this, we will ship your order within 2 business days and you should
          receive your order within 4 business days. Because we know this is an
          inconvenience and we want to help you achieve lasting weight loss
          affordably, we will offer a 35% refund off your order immediately,
          which typically takes 5-7 business days to be returned to your bank
          account. Because you paid $${tirzepatideOrders?.[0]?.amount_paid?.toFixed(
            2
          )}, your refund will be $${percentageAmount} if you choose
          to continue with semaglutide. You will not pay any additional amount
          for your semaglutide since you already paid for your order.`}
        </Typography>
        <br></br>
        <Typography variant="body1" sx={{ marginBottom: '16px' }}>
          {`Alternatively, you can choose to cancel your order entirely and you
          will receive a full refund on your medication. The full refund would
          be processed immediately and typically takes 5-7 business days to be
          returned to your bank account. You paid $${tirzepatideOrders?.[0]?.amount_paid?.toFixed(
            2
          )} for your medication, so
          you will receive that amount as a refund if you cancel your order.
          However, you will not receive any medication if you choose the full
          refund.`}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '48px',
          }}
        >
          <LoadingButton
            disabled={disableButton}
            onClick={() =>
              handleSwitchToSemaglutide(tirzepatideOrders?.[0]?.id)
            }
          >
            Get semaglutide & 35% refund
          </LoadingButton>
          <Button
            fullWidth
            color="grey"
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
            onClick={() => handleFullRefund(tirzepatideOrders?.[0]?.id)}
          >
            Cancel Rx and get full refund
          </Button>
        </Box>
      </>
    </Container>
  );
};

export default SwitchPrescription;
