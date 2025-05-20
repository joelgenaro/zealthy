import { ChangeEventHandler, useCallback, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Link,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { EditDeliveryAddress } from '../UpdatePatientInfo';
import { useVisitAsync, useVisitState } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePatientAddress,
  usePatientCareTeam,
  usePatientDefaultPayment,
  usePatientPayment,
  usePatientUnpaidInvoices,
  usePreIntakePrescriptionRequest,
  useWeightLossSubscription,
} from '@/components/hooks/data';
import { usePatientAsync } from '@/components/hooks/usePatient';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import { toast } from 'react-hot-toast';
import PaymentEditModal from '../PaymentEditModal';
import PatientPaymentMethod from '../PatientPaymentMethod';
import SubscriptionRestartModal from '../SubscriptionRestartModal';
import {
  useReactivateSubscription,
  useRenewSubscription,
  useUpdatePatient,
} from '@/components/hooks/mutations';
import {
  prescriptionRequestedEvent,
  prescriptionRequestedReorderBundleMonthlyEvent,
  prescriptionRequestedReorderMonthlyEvent,
  purchasedSemaglutideColoradoEvent,
  purchasedTirzepatideColoradoEvent,
} from '@/utils/freshpaint/events';
import ErrorMessage from '../ErrorMessage';
import { useSelector } from '@/components/hooks/useSelector';
import BasicModal from '../BasicModal';
import axios from 'axios';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import MedicareAttestationModal from '@/components/screens/PatientPortal/components/MedicareAttestationModal';
import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';
import { useVWO } from '@/context/VWOContext';
import medicationAttributeName from '@/utils/medicationAttributeName';
import { useABTest } from '@/context/ABZealthyTestContext';

interface ConfirmationProps {
  onNext?: () => void;
  isAdjustment?: boolean;
  isRefill?: boolean;
}

type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Insert'];

export function RecurringWeightLossMedicationAddOn({
  onNext,
  isAdjustment = false,
  isRefill,
}: ConfirmationProps) {
  const vwoClient = useVWO();
  const supabase = useSupabaseClient<Database>();
  const { code, refill } = Router.query;
  const { updatePatient: updatePatientAsync } = usePatientAsync();
  const { updateOnlineVisit: updateVisitAsync } = useVisitAsync();
  const submitQuestionnaireResponses = useQuestionnaireResponses();
  const [openCanceled, setOpenCanceled] = useState(false);
  const [openUpdatePayment, setOpenUpdatePayment] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openScheduledForCancelation, setOpenScheduledForCancelation] =
    useState(false);
  const [page, setPage] = useState<string>('confirm');
  const [open, setOpen] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState('');
  const [openMeidcareAttestationModal, setOpenMedicareAttestationModal] =
    useState(false);
  const { data: patientCareTeam } = usePatientCareTeam();
  const { data: patientInfo } = usePatient();
  const { data: patientAddress, refetch: refetchPatientAddress } =
    usePatientAddress();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { data: patientSubscriptions } = useAllVisiblePatientSubscription();
  const { data: weightLossSubscription, refetch } = useWeightLossSubscription();
  const { data: patientPrescriptionRequests } =
    usePreIntakePrescriptionRequest();
  const renewSubscription = useRenewSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const { data: unpaidInvoices } = usePatientUnpaidInvoices();
  const { data: patientPaymentProfile } = usePatientPayment();
  const { updateActionItem } = useMutatePatientActionItems();
  const updatePatient = useUpdatePatient();
  const [deliveryLoading, setDeliveryLoading] = useState<boolean>(false);
  const { medications } = useVisitState();
  const [loading, setLoading] = useState<boolean>(false);
  const [shippingId, setShippingId] = useState<string>('1');
  const medicationName = medicationAttributeName(medications?.[0]?.name);
  const ABZTest = useABTest();
  const { data: patient } = usePatient();

  const isPatient65OrOlder = isPatientSixtyFivePlus(
    patientInfo?.profiles?.birth_date || ''
  );

  //router as path includes pat portal
  const isBundled =
    medications?.[0]?.price === 297 || medications?.[0]?.price === 449;

  const totalDue = Math.floor(
    (medications?.[0]?.price ?? 0) + (shippingId === '2' ? 15 : 0)
  );

  const isPrescriptionCanceled = patientSubscriptions?.find(
    s =>
      s.product === 'Recurring Weight Loss Medication' &&
      s.status === 'canceled'
  );

  const compoundMeds = [
    'Semaglutide weekly injections',
    'Tirzepatide weekly injections',
    'Liraglutide weekly injections',
  ];
  const semaglutideBundled =
    useSelector(store => store.coaching).find(
      c => c.name === 'Zealthy Weight Loss + Semaglutide Program'
    ) ||
    (weightLossSubscription?.price === 297 ? weightLossSubscription : false);
  const tirzepatideBundled =
    useSelector(store => store.coaching).find(
      c => c.name === 'Zealthy Weight Loss + Tirzepatide Program'
    ) ||
    (weightLossSubscription?.price === 449 ? weightLossSubscription : false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShippingId((event.target as HTMLInputElement).value);
  };
  const handleOptIn: ChangeEventHandler<HTMLInputElement> = e =>
    setOptIn(e.target.checked);

  const handlePrescriptionRequest = async () => {
    setLoading(true);
    const medicationRequest: PrescriptionRequest = {
      patient_id: patientInfo?.id,
      region: patientInfo?.region,
      medication_quantity_id: medications?.[0].medication_quantity_id,
      status: Router.asPath.includes('/patient-portal')
        ? 'REQUESTED'
        : 'PRE_INTAKES',
      specific_medication: medications?.[0].name,
      note:
        !isBundled && !compoundMeds.includes(medications[0].name)
          ? `${medications?.[0].name} ${
              isAdjustment
                ? `THIS IS AN ADJUSTMENT TO CURRENT PRESCRIPTION: New Dosage: ${medications[0].dosage}, New Quantity: ${medications[0].quantity}, Name: ${medications[0].name}, New Refill schedule: renew every ${medications[0].recurring.interval_count} ${medications[0].recurring.interval}`
                : `Weight loss brand GLP1 - NOT BUNDLED - 1 month. Dosage: ${medications[0].dosage}`
            }`
          : isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 1 month. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 1 month.  Dosage: ${medications[0].dosage}`,
      total_price:
        (medications?.[0]?.price ?? 0) + (shippingId === '2' ? 15 : 0),
      shipping_method: parseInt(shippingId, 10),
      care_team: patientCareTeam?.map((e: any) => e.clinician_id),
      is_adjustment: isAdjustment,
    };

    if (code) {
      await supabase
        .from('single_use_appointment')
        .update({ used: true })
        .eq('id', code);
    }

    if (
      Router.asPath.includes('/patient-portal') ||
      Router.asPath.includes('/manage-prescriptions')
    ) {
      const prescriptionRequest = await supabase
        .from('prescription_request')
        .insert(medicationRequest)
        .select()
        .maybeSingle();

      if (prescriptionRequest.status === 201 && prescriptionRequest.data?.id) {
        const addToQueue = await supabase
          .from('task_queue')
          .insert({
            task_type: 'PRESCRIPTION_REFILL',
            patient_id: patientInfo?.id,
            queue_type: 'Provider (QA)',
          })
          .select()
          .maybeSingle()
          .then(({ data }) => data);
        await supabase
          .from('prescription_request')
          .update({ queue_id: addToQueue?.id })
          .eq('id', prescriptionRequest.data?.id);

        if (refill === 'true') {
          await Promise.allSettled([
            updatePatientAsync({
              last_refill_request: new Date().toISOString(),
            }),
            updateVisitAsync({
              status: 'Completed',
              completed_at: new Date().toISOString(),
            }),
            submitQuestionnaireResponses(),
          ]);
        }

        toast.success(
          'Your prescription request has been successfully submitted!'
        );
        await Promise.allSettled([
          vwoClient?.track(
            '5751',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6822-2',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6822-3',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5476',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5867',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5053',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5777',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5871_new',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          ABZTest.trackMetric(
            '5871_new',
            patient?.profile_id!,
            '1MonthPrescriptionRequestSubmitted'
          ),
          vwoClient?.track('4320', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track('7458', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track('8078', 'prescriptionRequestSubmitted', patientInfo),

          vwoClient?.track(
            '4918',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          ABZTest.trackMetric(
            '6465_new',
            patient?.profile_id!,
            '1MonthPrescriptionRequestSubmitted'
          ),
          vwoClient?.track('4320', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track('5053', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track(
            '6031',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6825',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6826',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            'Clone_6775',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7960',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            'Clone_6775_2',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '75801',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4798',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7960',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5483',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5483',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7743',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7935',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '8469',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '8676',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9363',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9057_1',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9057_2',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9057_3',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9502',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
        ]);
        prescriptionRequestedEvent(
          patientInfo?.profiles?.email!,
          medicationName,
          '1-month'
        );
        if (isBundled) {
          prescriptionRequestedReorderBundleMonthlyEvent(
            patientInfo?.profiles?.email!,
            medications?.[0]?.name,
            '1 Month',
            medications?.[0]?.dosage!
          );
        }
        if (
          Router.asPath.includes('weight-loss-compound-refill') &&
          patientInfo?.region === 'CO' &&
          medications?.[0]?.name?.toLowerCase()?.includes('semaglutide')
        ) {
          purchasedSemaglutideColoradoEvent(
            patientInfo?.profiles?.first_name || '',
            patientInfo?.profiles?.last_name || '',
            patientInfo?.profiles?.email || ''
          );
        }
        if (
          Router.asPath.includes('weight-loss-compound-refill') &&
          patientInfo?.region === 'CO' &&
          medications?.[0]?.name?.toLowerCase()?.includes('tirzepatide')
        ) {
          purchasedTirzepatideColoradoEvent(
            patientInfo?.profiles?.first_name || '',
            patientInfo?.profiles?.last_name || '',
            patientInfo?.profiles?.email || ''
          );
        } else {
          if (Router.asPath.includes('weight-loss-compound-refill')) {
            prescriptionRequestedReorderMonthlyEvent(
              patientInfo?.profiles?.email!,
              medications?.[0]?.name,
              '1 Month',
              medications?.[0]?.dosage!
            );
          }
        }
        onBack();
      } else {
        setLoading(false);
        toast.error('There was a problem submitting your prescription request');
      }
    } else {
      const foundPR = patientPrescriptionRequests?.find(
        p =>
          p.medication_quantity_id === medicationRequest.medication_quantity_id
      );
      if (patientPrescriptionRequests?.length && foundPR) {
        medicationRequest.id = foundPR.id;
      }

      const { data, error } = await supabase
        .from('prescription_request')
        .upsert(medicationRequest)
        .select()
        .maybeSingle();

      if (!error && patientInfo) {
        await Promise.allSettled([
          vwoClient?.track(
            '3216',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3452',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            'Clone_4687',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5871_new',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          ABZTest.trackMetric(
            '5871_new',
            patient?.profile_id!,
            '1MonthPrescriptionRequestSubmitted'
          ),
          vwoClient?.track(
            '6825',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6826',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            'Clone_6775',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            'Clone_6775_2',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '75801',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4798',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7895',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7960',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5483',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5483',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7935',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '8676',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9502',
            '1MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
        ]);
        prescriptionRequestedEvent(
          patientInfo?.profiles?.email!,
          medicationName,
          '1-month'
        );

        onBack();
      } else {
        setLoading(false);
        toast.error('There was a problem submitting your prescription request');
      }
    }
  };

  async function handleUpdateAddress(address: any) {
    if (!patientInfo?.id) {
      return;
    }
    setDeliveryLoading(true);
    const updatedAddress = await supabase
      .from('address')
      .update(address)
      .eq('patient_id', patientInfo?.id);

    if (address.state !== patientInfo?.region) {
      await updatePatient.mutateAsync({
        region: address.state,
      });
    }

    if (updatedAddress.status === 204) {
      setPage('confirm');
      refetchPatientAddress();
    } else {
      toast.error('There was an error updating address');
    }
    setDeliveryLoading(false);
  }

  const onBack = () => {
    if (onNext) {
      onNext();
    } else {
      setPage('responses-reviewed');
      window.scrollTo(0, 0);
      setLoading(false);
    }
  };

  const handleCanceledClose = useCallback(() => {
    setOpenCanceled(false);
  }, []);

  const handleScheduledForCancelationClose = useCallback(() => {
    setOpenScheduledForCancelation(false);
  }, []);

  const handleScheduledForCancelation = useCallback(async () => {
    //stop cancelation
    await reactivateSubscription.mutateAsync(
      weightLossSubscription!.reference_id!
    );
    //create prescription request
    await handlePrescriptionRequest();
    refetch();
  }, [reactivateSubscription, weightLossSubscription]);

  const handleCanceled = useCallback(async () => {
    await renewSubscription.mutateAsync(weightLossSubscription);
    refetch();
    await handlePrescriptionRequest();
  }, [refetch, renewSubscription, weightLossSubscription]);

  const handleSubmit = () => {
    if (!optIn)
      return setError(
        'In order to proceed you will need to select the box above to confirm you have read the terms'
      );
    if (weightLossSubscription?.status === 'scheduled_for_cancelation') {
      return setOpenScheduledForCancelation(true);
    }

    if (weightLossSubscription?.status === 'canceled') {
      return setOpenCanceled(true);
    }

    if ((unpaidInvoices?.length ?? 0) > 0) {
      return setOpenUpdatePayment(true);
    }

    if (isPatient65OrOlder) {
      return setOpenMedicareAttestationModal(true);
    }

    return handlePrescriptionRequest();
  };

  const handlePayAllInvoices = async () => {
    await axios.post(`/api/stripe/utils/authorization/issued`, {
      unpaidInvoices: unpaidInvoices,
      stripeCustomerId: patientPaymentProfile?.customer_id,
    });
  };
  const handleComplete = async () => {
    setLoading(true);
    await updateActionItem({
      patient_id: patientInfo?.id!,
      completed: true,
      completed_at: new Date().toISOString(),
      type: 'COMPOUND_MEDICATION_REQUEST',
    });
    Router.replace(Pathnames.PATIENT_PORTAL_PAYMENT_SUCCESS);
  };

  const listItems =
    semaglutideBundled || tirzepatideBundled
      ? [
          {
            title: 'Provider review: ',
            body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, you will receive your fill shipped to your home. Your Rx is included in your membership.',
          },
          {
            title: 'Check your email and SMS: ',
            body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
          },
          {
            body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
          },
        ]
      : compoundMeds.some(m => m.includes(medications[0]?.name))
      ? [
          {
            title: 'Provider review: ',
            body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, your payment method will be charged and you will receive your fill shipped to your home.',
          },
          {
            title: 'Check your email and SMS: ',
            body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
          },
          {
            body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
          },
        ]
      : [
          {
            title: 'Provider review: ',
            body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, it will be sent to your local pharmacy listed in your profile.',
          },
          {
            title: 'Check your email and SMS: ',
            body: 'Check your email and SMS: We’ll send you a message if your Provider has any questions or when your refill has been submitted to your pharmacy.',
          },
          {
            body: 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your refill. If you would prefer to have your Rx sent to a different pharmacy then update it using this link.',
          },
        ];

  return (
    <Container maxWidth="sm">
      {page === 'responses-reviewed' && (
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
          <LoadingButton
            type="button"
            loading={loading}
            disabled={loading}
            fullWidth
            onClick={handleComplete}
          >
            Continue
          </LoadingButton>
        </Box>
      )}
      {page === 'confirm' && (
        <>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '16px',
            }}
          >
            {isPrescriptionCanceled
              ? `By confirming below, you’ll be re-activating your medication subscription. Your Rx will be shipped to your home.`
              : medications?.[0]?.singlePaymentTitle
              ? medications?.[0]?.singlePaymentTitle
              : `${medications?.[0]?.name} has been added to your cart. You won’t be charged unless your provider approves your Rx request.`}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '24px',
              background: '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '16px',
              marginBottom: '16px',
            }}
          >
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Your medication'}
              </Typography>
              <Typography variant="subtitle1">
                {`${medications?.[0]?.name}`}
              </Typography>
              <Typography variant="subtitle1">
                {medications?.[0]?.dosage?.replace('mgs', 'mg')}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {`${
                  (medications?.[0]?.recurring?.interval_count ?? 0) === 0
                    ? '1 month supply'
                    : `Refill every ${
                        (medications?.[0]?.recurring?.interval_count ?? 0) > 1
                          ? `${medications?.[0]?.recurring?.interval_count} ${medications?.[0]?.recurring.interval}s`
                          : medications?.[0]?.recurring.interval
                      }`
                }`}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {medications?.[0]?.mgSavings}
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                sx={{ marginBottom: '2px' }}
              >
                {`$${totalDue} due if prescribed*`}
              </Typography>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Weekly dosage'}
              </Typography>
              <Typography
                component="div"
                variant="body1"
                fontSize="0.75rem !important"
              >{`Inject ${medications?.[0]?.dose}`}</Typography>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Total'}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {`$${totalDue} Due If Prescribed`}
              </Typography>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Total due today'}
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                sx={{ marginBottom: '2px' }}
              >
                {`$0`}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                Only pay if prescribed
              </Typography>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                component="h4"
                variant="body1"
                sx={{ color: '#989898', marginBottom: '16px' }}
              >
                Delivery options
              </Typography>
              <FormControl>
                <RadioGroup
                  aria-labelledby="delivery-options"
                  defaultValue="standard"
                  name="radio-buttons-group"
                  value={shippingId}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    sx={{ marginBottom: '10px' }}
                    label={
                      <>
                        <Typography
                          sx={{
                            fontWeight: '600',
                            fontSize: '14px !important',
                            lineHeight: '20px',
                            letterSpacing: '-0.006em',
                            color: '#1B1B1B',
                          }}
                        >
                          UPS Mail Innovations - $0
                        </Typography>
                        <Typography>{`Usually arrives in ${
                          compoundMeds.includes(medications?.[0]?.name)
                            ? '5-8'
                            : '2-5'
                        } days`}</Typography>
                      </>
                    }
                  />
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    sx={{ marginBottom: '16px' }}
                    label={
                      <>
                        <Typography
                          sx={{
                            fontWeight: '600',
                            fontSize: '14px !important',
                            lineHeight: '20px',
                            letterSpacing: '-0.006em',
                            color: '#1B1B1B',
                          }}
                        >
                          UPS Next Day Air Saver - $15
                        </Typography>
                        <Typography>{`Usually arrives in ${
                          compoundMeds.includes(medications?.[0]?.name)
                            ? '3-5'
                            : '1-2'
                        } days`}</Typography>
                      </>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Delivery address'}
              </Typography>
              <Typography>{patientAddress?.address_line_1}</Typography>
              <Typography>{patientAddress?.address_line_2}</Typography>
              <Typography>
                {patientAddress?.city}, {patientAddress?.state}
              </Typography>
              <Typography>{patientAddress?.zip_code}</Typography>
              <Typography sx={{ marginBottom: '16px' }}>
                United States
              </Typography>
              <Link
                onClick={() => setPage('delivery-address')}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {'Edit'}
              </Link>
            </Box>
            {paymentMethod ? (
              <>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '16px !important',
                    fontWeight: '600',
                    lineHeight: '24px !important',
                    color: '#989898',
                  }}
                >
                  {'Payment'}
                </Typography>
                <Stack gap="16px">
                  <PatientPaymentMethod paymentMethod={paymentMethod} />
                  <Link
                    onClick={() => setOpen(o => !o)}
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {'Edit'}
                  </Link>
                </Stack>
              </>
            ) : null}
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                textAlign: 'start',
                marginBottom: '1rem',
              }}
            >
              <FormControlLabel
                sx={{
                  margin: '0',
                  marginTop: '20px',
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': {
                    letterSpacing: '-0.006em',
                    lineHeight: '1.25rem',
                  },
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={optIn}
                    onChange={handleOptIn}
                    sx={{
                      padding: 0,
                      color: '#1B1B1B',
                      marginRight: '16px',
                    }}
                  />
                }
                label="By proceeding, you confirm you’re aware that Compound GLP-1 is not included in the price of the membership."
              />
            </Box>

            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <LoadingButton
              sx={{ width: '100%', marginBottom: '36px' }}
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
            >
              {`Confirm order - $0 due today`}
            </LoadingButton>
            <Stack gap={1.5} fontStyle="italic">
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                *You will be charged ${totalDue} if you are prescribed
                compounded semaglutide. This is what Zealthy expects to last a
                month. Your provider may recommend a different dosage amount,
                which would change the price.
              </Typography>
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                {Router.asPath.includes('/patient-portal')
                  ? `If prescribed, your medication subscription, which currently renews at $${totalDue} every 30 days, will be updated to the higher dosage, which means it will renew at $${totalDue} every 30 days.`
                  : `If prescribed, you are purchasing an automatically-renewing
                  subscription and will be charged $${totalDue} for the first 30
                  days and $${totalDue} every 30 days until you cancel.`}
              </Typography>
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                As part of your subscription, you will receive a 30-day supply
                of the prescription product(s) prescribed to you. The
                prescription product(s) associated with your subscription will
                be shipped to your address every 30 days. A partner pharmacy
                will refill and ship your prescription product(s) on the same
                continuous basis during the subscription period. We will notify
                you of any actions you need to take to ensure that the
                prescription product(s) associated with your subscription
                remains active. It is your responsibility to complete these
                actions. Unless you have canceled, your subscription will
                automatically renew even if you have not taken the required
                actions to ensure that the prescription product(s) associated
                with your subscription remains active.
              </Typography>
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                Your subscription will renew unless you cancel at least 2 days
                before the next renewal date.
              </Typography>
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                You can view your renewal date and cancel your subscription(s)
                through your account or by contacting customer support at
                support@getzealthy.com. If you cancel, it will take effect at
                the end of the current subscription period and, if applicable,
                you will continue to get the active prescription product(s)
                associated with your subscription until the end of the
                subscription period.
              </Typography>
            </Stack>
          </Box>
          <PaymentEditModal
            onClose={() => setOpenPaymentModal(o => !o)}
            open={openPaymentModal}
            title="Add new payment method to order your GLP-1 medication"
            handlePrescriptionRequest={handlePrescriptionRequest}
            setOpenUpdatePayment={setOpenUpdatePayment}
            handlePayAllInvoices={handlePayAllInvoices}
          />
          <MedicareAttestationModal
            open={openMeidcareAttestationModal}
            submitRequest={handlePrescriptionRequest}
          />
        </>
      )}
      {page === 'delivery-address' && (
        <>
          <EditDeliveryAddress goHome={() => setPage('confirm')} />
        </>
      )}
      <SubscriptionRestartModal
        titleOnSuccess={'Your subscription has been reactivated.'}
        onConfirm={handleCanceled}
        onClose={handleCanceledClose}
        title={'Reactivate your weight loss membership to order medication?'}
        description={[
          'In order to order medication, you need to have an active Weight Loss membership, which covers your provider developing your treatment plan and ensuring you are receiving high-quality care.',
          'Once you confirm below, your Zealthy Weight Loss subscription will become active again. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
        ]}
        medication={medications[0]}
        open={openCanceled}
        buttonText="Yes, reactivate and order"
      />
      <SubscriptionRestartModal
        titleOnSuccess={'Your subscription has been reactivated.'}
        open={openScheduledForCancelation}
        title={'Reactivate your weight loss membership to order medication?'}
        description={[
          'In order to order medication, you need to have an active Weight Loss membership that is not scheduled for cancellation within the next month, since this will allow your provider to monitor your care during the entire period of taking your medication.',
          'Once you confirm below, your Zealthy Weight Loss subscription will no longer be scheduled for cancellation. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
        ]}
        medication={medications[0]}
        onConfirm={handleScheduledForCancelation}
        onClose={handleScheduledForCancelationClose}
        buttonText="Yes, reactivate and order"
      />
      <BasicModal isOpen={openUpdatePayment} useMobileStyle={false}>
        <Typography variant="h3" textAlign="center">
          You must add updated payment information to submit your GLP-1
          medication order.
        </Typography>
        <Typography textAlign="center">
          In order to order medication, you need to have valid payment
          information.
        </Typography>
        <Typography textAlign="center">
          You will only pay for medication if prescribed.
        </Typography>
        <Stack gap="10px">
          <LoadingButton
            size="small"
            onClick={() => {
              setOpenPaymentModal(true);
            }}
          >
            Update payment and continue
          </LoadingButton>
          <Button
            size="small"
            variant="outlined"
            onClick={() => history.back()}
          >
            Cancel
          </Button>
        </Stack>
      </BasicModal>
    </Container>
  );
}
