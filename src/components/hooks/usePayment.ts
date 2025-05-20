import { useApi } from '@/context/ApiContext';
import { CheckoutSuccessResponse } from '@/types/api/checkout';
import { CreateChargeRefundResponse } from '@/types/api/create-charge-refund';
import { MedicationSubscriptionRequestParams } from '@/types/api/create-medication-subscription';
import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
} from '@/types/api/create-payment-intent';
import { CreateSetupIntentResponse } from '@/types/api/create-setup-intent';
import {
  CreateSubscriptionsRequest,
  UpgradeSubscriptionsRequest,
  CreateSubscriptionKlarna,
} from '@/types/api/create-subscriptions';
import {
  DefaultPaymentMethodResponse,
  Patient,
} from '@/types/api/default-payment-method';
import { OutstandingBalanceSuccessResponse } from '@/types/api/outstanding-balance';
import { RenewSubscriptionRequestParams } from '@/types/api/renew-subscription';
import { ReplaceSubscriptionRequestParams } from '@/types/api/replace-subscription';
import { Endpoints } from '@/types/endpoints';
import { useUser } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';
import { Stripe } from 'stripe';
import { Order } from '../screens/Checkout/types';
import { usePatient } from './data';
import { useProfileState } from './useProfile';

type StripePatientToCustomer = {
  id: number;
  region: string;
  fullName: string;
  email: string;
};

export const usePayment = () => {
  const { data: patient } = usePatient();
  const user = useUser();
  const { first_name, last_name } = useProfileState();
  const api = useApi();

  const fullName = `${first_name} ${last_name}`;

  const cancelSubscription = useCallback(
    async (subscriptionId: string, cancelationReason: string) => {
      return api.post(Endpoints.CANCEL_STRIPE_SUBSCRIPTION, {
        subscriptionId,
        cancelationReason,
      });
    },
    [api]
  );

  const createMedicationSubscription = useCallback(
    async (params: MedicationSubscriptionRequestParams) => {
      return api.post<Stripe.Subscription>(
        Endpoints.CREATE_MEDICATION_SUBSCRIPTION,
        params
      );
    },
    [api]
  );

  const createSubscriptions = useCallback(
    async (
      patient_id: CreateSubscriptionsRequest['patient_id'],
      subscriptions: CreateSubscriptionsRequest['subscriptions']
    ) => {
      return api.post<Stripe.Subscription[]>(
        Endpoints.PAYMENT_CREATE_SUBSCRIPTIONS,
        {
          patient_id,
          subscriptions,
        }
      );
    },
    [api]
  );

  const createSubscriptionKlarna = useCallback(
    async (
      patient_id: CreateSubscriptionsRequest['patient_id'],
      subscription: CreateSubscriptionKlarna['subscription']
    ) => {
      const { data, error } = await api
        .post<CreatePaymentIntentResponse>(
          Endpoints.CREATE_SUBSCRIPTION_KLARNA,
          {
            patient_id,
            subscription,
          }
        )
        .then(({ data }) => ({ data, error: null }))
        .catch(err => ({ data: null, error: err.message }));

      return { data, error };
    },
    [api]
  );

  const upgradeSubscription = useCallback(
    async (
      patient_id: CreateSubscriptionsRequest['patient_id'],
      subscription: UpgradeSubscriptionsRequest['subscription']
    ) => {
      return api.post<Stripe.Subscription[]>(
        Endpoints.PAYMENT_UPGRADE_SUBSCRIPTIONS,
        {
          patient_id,
          subscription,
        }
      );
    },
    [api]
  );

  const renewSubscription = useCallback(
    (
      subscription: RenewSubscriptionRequestParams['subscription'],
      coupon?: string
    ) => {
      return api.post<Stripe.Subscription>(
        Endpoints.RENEW_STRIPE_SUBSCRIPTION,
        {
          subscription,
          patient_id: patient?.id,
          coupon,
        }
      );
    },
    [api, patient?.id]
  );

  const renewPrescription = useCallback(
    (subscription: RenewSubscriptionRequestParams['subscription']) => {
      return api.post<Stripe.Subscription>(
        Endpoints.RENEW_STRIPE_PRESCRIPTION,
        {
          subscription,
          patient_id: patient?.id,
        }
      );
    },
    [api, patient?.id]
  );

  const replaceSubscription = useCallback(
    (subscription: ReplaceSubscriptionRequestParams['subscription']) => {
      return api.post<Stripe.Subscription>(
        Endpoints.REPLACE_STRIPE_SUBSCRIPTION,
        {
          subscription,
          patient_id: patient?.id,
        }
      );
    },
    [api, patient?.id]
  );

  const reactivateSubscription = useCallback(
    (subscriptionId: string) => {
      return api.post<Stripe.Subscription>(
        Endpoints.REACTIVATE_STRIPE_SUBSCRIPTION,
        {
          subscriptionId,
        }
      );
    },
    [api]
  );

  const scheduleForCancelation = useCallback(
    async (
      subscriptionId: string,
      cancelationReason?: string | null,
      cancelChoiceReasons?: string[]
    ) => {
      try {
        const response = await api.post(
          Endpoints.SCHEDULE_FOR_CANCEL_STRIPE_SUBSCRIPTION,
          {
            subscriptionId,
            cancelationReason,
            cancelChoiceReasons,
          }
        );

        // If we get here, the request was successful
        return { success: true, data: response.data, error: null };
      } catch (error: any) {
        console.error('Error cancelling subscription:', error);

        // Check if the error response contains a message indicating partial success
        if (error?.response?.status === 200 && error?.response?.data?.message) {
          // This is a partial success case
          console.warn('Partial success:', error.response.data.message);
          return {
            success: true,
            data: error.response.data,
            warning: error.response.data.warning,
            error: null,
          };
        }

        // Otherwise, it's a real error
        return {
          success: false,
          data: null,
          error:
            error?.response?.data ||
            error?.message ||
            'An unexpected error occurred',
        };
      }
    },
    [api]
  );

  const createStripeCustomer = useCallback(
    (patient: StripePatientToCustomer) => {
      return api.post(Endpoints.CREATE_STRIPE_CUSTOMER, {
        patient,
      });
    },
    [api]
  );

  const checkout = useCallback(
    async (
      amount: number,
      metadata?: Record<string, unknown>,
      description?: string
    ) => {
      return api
        .post<CheckoutSuccessResponse>(Endpoints.PAYMENT_CHECKOUT, {
          amount,
          patient: {
            id: patient?.id,
            region: patient?.region,
            fullName,
            email: user!.email,
          },
          metadata,
          description,
        })
        .then(({ data }) => {
          if (!data) {
            throw new Error('Something went wrong. Please try again');
          }
          return {
            data,
            error: null,
          };
        })
        .catch(err => ({ data: null, error: err as Error }));
    },
    [api, fullName, patient, user]
  );

  const paymentAddOn = useCallback(
    async (coaching: Order['coaching'][number]) => {
      return api.post<Stripe.Response<Stripe.Subscription>>(
        Endpoints.PAYMENT_ADDON,
        {
          coaching,
          patient: {
            id: patient?.id,
            region: patient?.region,
            fullName,
            email: user!.email,
          },
        }
      );
    },
    [api, fullName, patient, user]
  );

  const defaultPaymentMethod = useCallback(
    async (patient: Patient) => {
      const { data, error } = await api
        .get<DefaultPaymentMethodResponse>(Endpoints.DEFAULT_PAYMENT_METHOD, {
          params: {
            patientId: patient.id,
          },
        })
        .then(({ data }) => ({ data, error: null }))
        .catch(err => ({ data: null, error: err.message }));

      return { data, error };
    },
    [api]
  );

  const updateDefaultPaymentMethod = useCallback(
    async (patient: Patient, paymentMethodId: string) => {
      const { data, error } = await api
        .post<DefaultPaymentMethodResponse>(
          Endpoints.UPDATE_DEFAULT_PAYMENT_METHOD,
          {
            patientId: patient.id,
            paymentMethodId,
          }
        )
        .then(({ data }) => ({ data, error: null }))
        .catch(err => ({ data: null, error: err.message }));

      return { data, error };
    },
    [api]
  );

  const createChargeRefund = useCallback(
    async (chargeId: string, refundAmount: number) => {
      const { data, error } = await api
        .post<CreateChargeRefundResponse>(Endpoints.CREATE_CHARGE_REFUND, {
          chargeId,
          refundAmount,
        })
        .then(({ data }) => ({ data, error: null }))
        .catch(err => ({ data: null, error: err.message }));

      return { data, error };
    },
    [api]
  );

  const createSetupIntent = useCallback(
    async (patientId: number, isKlarnaPayment: boolean = false) => {
      const { data, error } = await api
        .post<CreateSetupIntentResponse>(Endpoints.CREATE_SETUP_INTENT, {
          patientId,
          isKlarnaPayment,
        })
        .then(({ data }) => ({ data, error: null }))
        .catch(err => ({ data: null, error: err.message }));

      return { data, error };
    },
    [api]
  );

  const createPaymentIntent = useCallback(
    async (
      patientId: number,
      amount: number,
      metadata: CreatePaymentIntentRequest['metadata'],
      userAgent: string = '',
      isKlarnaPayment: boolean = false,
      isOneTimePayment: boolean = true
    ) => {
      const { data, error } = await api
        .post<CreatePaymentIntentResponse>(Endpoints.CREATE_PAYMENT_INTENT, {
          patientId,
          amount,
          metadata,
          userAgent,
          isKlarnaPayment,
          isOneTimePayment,
        })
        .then(({ data }) => ({ data, error: null }))
        .catch(err => ({ data: null, error: err.message }));

      return { data, error };
    },
    [api]
  );

  const createInvoicePayment = useCallback(
    async (
      patientId: number,
      amount: number,
      metadata: CreatePaymentIntentRequest['metadata'],
      description: string,
      doNotCharge: boolean = false,
      idempotencyKey?: string
    ) => {
      const { data, error } = await api
        .post<CreatePaymentIntentResponse>(Endpoints.CREATE_INVOICE_PAYMENT, {
          patientId,
          amount,
          metadata,
          description,
          doNotCharge,
          idempotencyKey,
        })
        .then(({ data }) => ({ data, error: null }))
        .catch(err => ({ data: null, error: err.message }));

      return { data, error };
    },
    [api]
  );

  const outstandingBalance = useCallback(
    async (patientId: number) => {
      return api
        .get<OutstandingBalanceSuccessResponse>(Endpoints.OUTSTANDING_BALANCE, {
          params: {
            patientId,
          },
        })
        .then(({ data }) => {
          if (!data) {
            throw new Error('Something went wrong. Please try again');
          }
          return {
            data,
            error: null,
          };
        })
        .catch(err => ({ data: null, error: err.message }));
    },
    [api]
  );

  const voidInvoices = useCallback(async (patientId: number) => {
    return api.post(Endpoints.VOID_INVOICES, {
      patientId,
    });
  }, []);

  return {
    checkout,
    paymentAddOn,
    createStripeCustomer,
    createSubscriptions,
    reactivateSubscription,
    scheduleForCancelation,
    renewSubscription,
    renewPrescription,
    replaceSubscription,
    upgradeSubscription,
    defaultPaymentMethod,
    updateDefaultPaymentMethod,
    createSetupIntent,
    createChargeRefund,
    outstandingBalance,
    voidInvoices,
    createPaymentIntent,
    createInvoicePayment,
    createMedicationSubscription,
    cancelSubscription,
    createSubscriptionKlarna,
  };
};
