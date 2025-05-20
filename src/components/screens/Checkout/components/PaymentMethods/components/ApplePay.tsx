import { Box } from '@mui/material';
import { PaymentRequest } from '@stripe/stripe-js';
import {
  PaymentRequestButtonElement,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  PaymentMethod,
  StripePaymentRequestButtonElementOptions,
} from '@stripe/stripe-js';
import { useCallback, useEffect, useMemo } from 'react';
import { usePayment } from '@/components/hooks/usePayment';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitState } from '@/components/hooks/useVisit';
import {
  usePatient,
  usePatientIncompleteVisits,
} from '@/components/hooks/data';
import {
  getCheckoutInvoiceDescription,
  getCheckoutInvoiceProduct,
} from '@/utils/getCheckoutInvoiceDescription';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';

type StripePaymentMethodEvent = {
  paymentMethod: PaymentMethod;
  complete: (res: string) => void;
};

interface ApplePayProps {
  paymentRequest: PaymentRequest;
  onError: (error: string) => void;
  onSuccess: (transaction_id: string) => Promise<void>;
  amount: number;
}

const ApplePay = ({
  paymentRequest,
  onSuccess,
  onError,
  amount,
}: ApplePayProps) => {
  const stripe = useStripe();
  const { checkout } = usePayment();
  const { data: patient } = usePatient();
  const { id: visitId } = useVisitState();
  const calculatedSpecificCare = useCalculateSpecificCare();
  const { specificCare, potentialInsurance } = useIntakeState();
  const { data: incompleteVisits } = usePatientIncompleteVisits();

  const careSelections = useSelector(store =>
    store.visit.selectedCare.careSelections.map(item => item.reason).join(', ')
  );
  let mostRecentVisit;

  if (visitId) {
    mostRecentVisit = incompleteVisits?.find(visit => visit.id === visitId);
  } else {
    mostRecentVisit = incompleteVisits?.[0];
  }

  const visitCare = mostRecentVisit?.specific_care;
  const visitInsurance = mostRecentVisit?.potential_insurance;

  const invoiceDescription = useMemo(() => {
    return getCheckoutInvoiceDescription(
      specificCare || calculatedSpecificCare || visitCare || '',
      potentialInsurance || visitInsurance || ''
    );
  }, [
    specificCare,
    calculatedSpecificCare,
    potentialInsurance,
    visitCare,
    visitInsurance,
  ]);

  const handlePaymentIntent = useCallback(
    async (event: StripePaymentMethodEvent, clientSecret: string) => {
      const { paymentIntent, error: confirmError } =
        await stripe!.confirmCardPayment(
          clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false }
        );

      if (confirmError) {
        event.complete('fail');
        onError(
          confirmError.message || 'Something went wrong. Please try again.'
        );
      } else {
        event.complete('success');
        // @ts-ignore
        if (paymentIntent.status === 'requires_action') {
          // Let Stripe.js handle the rest of the payment flow.
          const { error } = await stripe!.confirmCardPayment(clientSecret);
          if (error) {
            onError(error.message || 'Something went wrong. Please try again.');
          } else {
            await onSuccess(paymentIntent.id);
          }
        } else {
          await onSuccess(paymentIntent.id);
        }
      }
    },
    [onError, onSuccess, stripe]
  );

  const handleSetupIntent = useCallback(
    async (event: StripePaymentMethodEvent, clientSecret: string) => {
      const { setupIntent, error: confirmError } =
        await stripe!.confirmCardSetup(
          clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false }
        );

      if (confirmError) {
        event.complete('fail');
        onError(
          confirmError.message || 'Something went wrong. Please try again.'
        );
      } else {
        event.complete('success');
        // @ts-ignore
        if (setupIntent.status === 'requires_action') {
          // Let Stripe.js handle the rest of the payment flow.
          const { error } = await stripe!.confirmCardSetup(clientSecret);
          if (error) {
            onError(error.message || 'Something went wrong. Please try again.');
          } else {
            await onSuccess(setupIntent.id);
          }
        } else {
          await onSuccess(setupIntent.id);
        }
      }
    },
    [onError, onSuccess, stripe]
  );

  const handlePaymentMethodEvent = useCallback(
    async (e: StripePaymentMethodEvent) => {
      if (!stripe) return;

      const metadata: Record<string, unknown> = {
        zealthy_care: specificCare || careSelections || visitCare,
        zealthy_patient_id: patient?.id,
        zealthy_product_name: getCheckoutInvoiceProduct(
          specificCare || calculatedSpecificCare || visitCare || '',
          potentialInsurance || visitInsurance || ''
        ),
      };

      const { data, error } = await checkout(
        amount,
        metadata,
        invoiceDescription
      );

      if (error) {
        onError(error?.message || 'Something went wrong. Please try again');
        return;
      }

      if (data.type === 'payment_intent') {
        await handlePaymentIntent(e, data.client_secret);
      } else {
        await handleSetupIntent(e, data.client_secret);
      }
    },
    [stripe, checkout, amount, onError, handlePaymentIntent, handleSetupIntent]
  );

  useEffect(() => {
    if (!paymentRequest) return;

    // @ts-ignore
    paymentRequest.on('paymentmethod', handlePaymentMethodEvent);

    return () => {
      // @ts-ignore
      paymentRequest.off('paymentmethod', handlePaymentMethodEvent);
    };
  }, [handlePaymentMethodEvent, paymentRequest]);

  const style: StripePaymentRequestButtonElementOptions['style'] = useMemo(
    () => ({
      paymentRequestButton: {
        type: 'default',
        theme: 'light',
        height: '56px',
      },
    }),
    []
  );

  if (!paymentRequest) return null;

  return (
    <Box border="1px solid #D8D8D8" borderRadius="12px" overflow="hidden">
      <PaymentRequestButtonElement options={{ paymentRequest, style }} />
    </Box>
  );
};

export default ApplePay;
