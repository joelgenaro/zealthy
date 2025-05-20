import axios from 'axios';
import { capitalize } from '@/utils/capitalize';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { purchaseEvent as rdPurchaseEvent } from '@/utils/rudderstack/events';
import { getUnixTime } from 'date-fns';
import { mapVariantToCareType } from '../mapVariantToCareType';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import getServerConfig from '../../../config-server';
import { trackWithDeduplication } from './utils';

const getVisitRoomLink = (environment: string) => {
  return environment === 'production'
    ? 'https://app.getzealthy.com/patient-portal'
    : 'https://frontend-next-git-development-zealthy.vercel.app/patient-portal';
};

const {
  name: siteName,
  paymentSuccessEvent,
  purchaseSuccessEvent,
} = getServerConfig(process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com');

declare global {
  interface Window {
    dataLayer: any[];
  }
}

function careToValue(
  care: SpecificCareOption,
  ins: PotentialInsuranceOption,
  eventName?: string,
  medication?: Medication
) {
  switch (care) {
    case SpecificCareOption.WEIGHT_LOSS:
      switch (ins) {
        case PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA:
          return 350;
        case PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED:
          return 800;
        case PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED:
          return 300;
        case PotentialInsuranceOption.TIRZEPATIDE_BUNDLED:
          return 850;
        default:
          return 150;
      }
    case SpecificCareOption.BIRTH_CONTROL:
      return 50;
    case SpecificCareOption.ANXIETY_OR_DEPRESSION:
      return 130;
    case SpecificCareOption.HAIR_LOSS:
    case SpecificCareOption.FEMALE_HAIR_LOSS:
      return 80;
    case SpecificCareOption.ERECTILE_DYSFUNCTION:
      return 250;
    case SpecificCareOption.PRIMARY_CARE:
      return 140;
    case SpecificCareOption.ASYNC_MENTAL_HEALTH:
      return 347;
    case SpecificCareOption.PRE_WORKOUT:
      return 100;
    case SpecificCareOption.SEX_PLUS_HAIR:
      return 75;
    case SpecificCareOption.PREP:
      return 160;
    case SpecificCareOption.ENCLOMIPHENE:
      return 400;
    case SpecificCareOption.SLEEP:
      return 80;
    case SpecificCareOption.SKINCARE:
    case SpecificCareOption.ACNE:
    case SpecificCareOption.ROSACEA:
    case SpecificCareOption.MELASMA:
    case SpecificCareOption.ANTI_AGING:
      return 20;
    default:
      return 74;
  }
}

interface IAppointment {
  appointment_type: string;
  starts_at: number;
  ends_at: number;
  status: string;
}

interface AppointmentProps {
  patient_id: number;
  clinician_id: number;
  appointment_type: string;
  starts_at: number;
  ends_at: number;
  zoom_link: string | null | undefined;
  daily_room: string | null | undefined;
}

export const paymentEvent = async (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  value: number,
  care_selection: string | undefined,
  product_name: string | undefined,
  frequency: string | undefined,
  is_new: boolean,
  full_price: number | null,
  origin_url: string | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: paymentSuccessEvent,
        properties: {
          distinct_id: id ?? email,
          email: email,
          phone,
          first_name,
          last_name,
          state,
          frequency,
          care_selection,
          value,
          is_new,
          full_price,
          product_name,
          currency: 'USD',
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info('payment-success', JSON.stringify(paymentSuccess.data));
  }
};

export const purchaseEvent = (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  careSelections: string,
  calculatedSpecificCare: SpecificCareOption,
  specificCare: SpecificCareOption,
  potentialInsurance: PotentialInsuranceOption,
  transactionId: string,
  variant?: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    if (
      potentialInsurance === PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
    ) {
      window.freshpaint?.track('purchase-oral-semaglutide-bundled', {
        email,
        phone,
        first_name,
        last_name,
        state,
        care_selection: 'Weight loss',
        care_type:
          specificCare === 'Hair Loss'
            ? 'female hair loss'
            : variant && variant.includes('5674')
            ? mapVariantToCareType[variant!]
            : potentialInsurance || specificCare,
        content_name: calculatedSpecificCare,
        value: careToValue(
          specificCare || calculatedSpecificCare,
          potentialInsurance
        ),
        currency: 'USD',
      });
    } else if (specificCare === 'Preworkout') {
      window.freshpaint?.track('purchase-success-pw', {
        email,
        phone,
        first_name,
        last_name,
        state,
        care_selections: careSelections,
        care_selection: 'Preworkout',
        care_type: 'Preworkout',
        content_name: calculatedSpecificCare,
        value: 300,
        currency: 'USD',
      });
    } else if (!['Mental health']?.includes(specificCare)) {
      window.freshpaint?.track(purchaseSuccessEvent, {
        email,
        phone,
        first_name,
        last_name,
        state,
        care_selections: careSelections,
        care_selection: specificCare || calculatedSpecificCare,
        care_type:
          variant === '4758'
            ? 'Weight Loss Flexible'
            : variant === '5328'
            ? 'Weight Loss Ad'
            : variant && variant?.includes('5674')
            ? mapVariantToCareType[variant!]
            : potentialInsurance || specificCare,
        content_name: calculatedSpecificCare,
        value: careToValue(
          specificCare || calculatedSpecificCare,
          potentialInsurance
        ),
        currency: 'USD',
      });
    }

    // Purchase event for Facebook
    potentialInsurance === PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
      ? null
      : window.freshpaint?.track(
          ['Zealthy', 'FitRx'].includes(siteName ?? '')
            ? 'Purchase'
            : 'Purchase-ZPlan',
          {
            email,
            phone,
            first_name,
            last_name,
            state,
            care_selections: careSelections,
            care_selection: [
              'Hyperpigmentation Dark Spots',
              'Acne',
              'Rosacea',
              'Fine Lines & Wrinkles',
            ].includes(careSelections)
              ? 'Skincare'
              : specificCare || calculatedSpecificCare,
            care_type: [
              'Hyperpigmentation Dark Spots',
              'Acne',
              'Rosacea',
              'Fine Lines & Wrinkles',
            ].includes(careSelections)
              ? 'Skincare'
              : variant === '4758'
              ? 'Weight Loss Flexible'
              : variant === '5328'
              ? 'Weight Loss Ad'
              : variant && variant.includes('5674')
              ? mapVariantToCareType[variant!]
              : potentialInsurance || specificCare,
            content_name: calculatedSpecificCare,
            value: careToValue(
              specificCare || calculatedSpecificCare,
              potentialInsurance,
              'Purchase'
            ),
            currency: 'USD',
          }
        );
    window.VWO?.event('Purchase');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer?.push({
      event: 'purchase',
      value: careToValue(
        specificCare || calculatedSpecificCare,
        potentialInsurance,
        'Purchase'
      ),
    });
    window.freshpaint?.identify(id, {
      email,
      converted: true,
      converted_at: new Date().toISOString(),
      converted_care_selection: specificCare || calculatedSpecificCare,
      converted_care_type: potentialInsurance
        ? potentialInsurance
        : specificCare,
    });
    window.jumbleberry?.('track', 'Purchase', {
      transaction_id: transactionId,
      order_value: '75.00',
    });
  }
  window.STZ?.trackEvent('Purchase');
  rdPurchaseEvent(
    email,
    phone,
    first_name,
    last_name,
    state,
    careSelections,
    calculatedSpecificCare,
    specificCare,
    potentialInsurance,
    transactionId,
    variant
  );
};

export const purchaseGlp1Event = (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  careSelections: string,
  calculatedSpecificCare: SpecificCareOption,
  specificCare: SpecificCareOption,
  potentialInsurance: PotentialInsuranceOption,
  transactionId: string,
  variant?: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('purchase-success-wl-glp1', {
      email,
      phone,
      first_name,
      last_name,
      state,
      care_selections: careSelections,
      care_selection: specificCare || calculatedSpecificCare,
      care_type:
        variant === '4758b'
          ? 'Semaglutide Bundled Flexible'
          : potentialInsurance || specificCare,
      content_name: calculatedSpecificCare,
      value: careToValue(specificCare, potentialInsurance),
      currency: 'USD',
    });
    window.VWO?.event('Purchase');
    window.freshpaint?.identify(id, {
      email,
      converted: true,
      converted_at: new Date().toISOString(),
      converted_care_selection: specificCare || calculatedSpecificCare,
      converted_care_type: potentialInsurance
        ? potentialInsurance
        : specificCare,
    });
    window.jumbleberry?.('track', 'Purchase', {
      transaction_id: transactionId,
      order_value: '75.00',
    });
  }
  window.STZ?.trackEvent('Purchase');
};

export const identityEvent = (
  info: {
    phone_number: string;
    first_name: string;
    last_name: string;
  },
  id: string,
  email: string,
  timezone: string,
  subscribed_to_sms_marketing: boolean
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy' &&
    (email || id)
  ) {
    let e164Phone = info?.phone_number?.replace(/\D/g, '');
    if (e164Phone?.length === 11 && e164Phone?.[0] === '1') {
      e164Phone = '+' + e164Phone;
    } else if (e164Phone?.length === 10 && e164Phone?.[0] !== '1') {
      e164Phone = '+1' + e164Phone;
    }
    info.phone_number = e164Phone;
    if (email && id && email !== id) {
      window.freshpaint.alias(email, id);
    }
    const distinctId = id || email;

    window.freshpaint.identify(distinctId, {
      first_name: info.first_name,
      last_name: info.last_name,
      email: email,
      phone: info.phone_number,
      timezone: timezone,
      cio_subscription_preferences: {
        topics: {
          topic_1: subscribed_to_sms_marketing,
        },
      },
    });
  }
};

export const appointmentCanceledEvent = async (
  id: string,
  email: string,
  appointment: AppointmentProps
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const apptCanceled = await axios.post('https://api.perfalytics.com/track', {
      event: 'appointment-canceled-provider',
      properties: {
        distinct_id: id,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        email: email,
        patient: appointment.patient_id,
        clinician: appointment.clinician_id,
        appointment_type: appointment.appointment_type,
        appointment_start_at: appointment.starts_at,
        appointment_end_at: appointment.ends_at,
        zoom_link: appointment.zoom_link,
        appointment_link: appointment.daily_room,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log({ DATA: apptCanceled.data });
  }
};

export const appointmentScheduledEvent = async (
  id: string,
  email: string,
  phone_number: string,
  appointment: AppointmentProps,
  callNum: 1 | 2 | 3 | 4
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const apptScheduled = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'scheduled-appointment',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          clinician: appointment.clinician_id,
          appointment_type: appointment.appointment_type,
          appointment_start_at: appointment.starts_at,
          appointment_end_at: appointment.ends_at,
          zoom_link: appointment.zoom_link,
          call_num: callNum,
          appointment_link: appointment.daily_room,
          phone_number: phone_number,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    // const apptScheduled = await axios.post(
    //   'https://api.perfalytics.com/track',
    //   payload
    // );
    console.log({ DATA: apptScheduled.data });
  }
};

export const appointmentScheduledProviderEvent = async (
  id: string,
  provider_email: string,
  provider_phone: string,
  appointment: AppointmentProps,
  callNum: 1 | 2 | 3 | 4
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const apptScheduled = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'scheduled-appointment-provider',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: provider_email,
          phone: provider_phone,
          patient: appointment.patient_id,
          appointment_type: appointment.appointment_type,
          appointment_start_at: appointment.starts_at,
          appointment_end_at: appointment.ends_at,
          zoom_link: appointment.zoom_link,
          appointment_link: appointment.daily_room,
          call_number: callNum,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log({ DATA: apptScheduled.data });
  }
};

export const messageEvent = async (
  senderEmail: string | undefined | null,
  receiverId: string | undefined | null,
  receiverEmail: string | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'message-received',
      properties: {
        distinct_id: receiverId,
        email: receiverEmail,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        recipient: receiverEmail,
        sender: senderEmail,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('message-received', JSON.stringify(message.data));
  }
};
export const initialMessageEvent = async (
  senderEmail: string | undefined | null,
  receiverId: string | null | undefined,
  receiverEmail: string | undefined | null,
  emailContent: string | undefined | null,
  textContent: string | undefined | null,
  senderName: string | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'initial-message-received',
      properties: {
        distinct_id: receiverId,
        email: receiverEmail,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        recipient: receiverEmail,
        sender: senderEmail,
        senderName,
        emailMessage: emailContent,
        textMessage: textContent,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('initial-message-received', JSON.stringify(message.data));
  }
};
export const messageToSkipEvent = async (
  senderEmail: string | undefined | null,
  receiverId: string | undefined | null,
  receiverEmail: string | undefined | null,
  emailContent: string | undefined | null,
  textContent: string | undefined | null,
  senderName: string | undefined | null
) => {
  if (process.env.NODE_ENV === 'production') {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'initial-message-skip',
      properties: {
        distinct_id: receiverId,
        email: receiverEmail,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        recipient: receiverEmail,
        sender: senderEmail,
        senderName,
        emailMessage: emailContent,
        textMessage: textContent,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('initial-message-skip', JSON.stringify(message.data));
  }
};
export const messageNonPHIEvent = async (
  senderEmail: string | undefined | null,
  receiverId: string | undefined | null,
  receiverEmail: string | undefined | null,
  emailContent: string | undefined | null,
  textContent: string | undefined | null,
  senderName: string | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'message-received-non-phi',
      properties: {
        distinct_id: receiverId,
        email: receiverEmail,
        emailMessage: emailContent,
        textMessage: textContent,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        recipient: receiverEmail,
        sender: senderEmail,
        senderName,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('message-received-non-phi', JSON.stringify(message.data));
  }
};

export const weightLossThreadResponse = async (
  profileId: string | undefined | null,
  patientEmail: string | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'weight-loss-patient-responded',
      properties: {
        distinct_id: profileId,
        email: patientEmail,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('weight-loss-patient-responded', JSON.stringify(message.data));
  }
};
export const messagePrescriptionPendingEvent = async (
  senderEmail: string | undefined | null,
  receiverId: string | undefined | null,
  receiverEmail: string | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'message-prescription-pending',
      properties: {
        distinct_id: receiverId,
        email: receiverEmail,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        recipient: receiverEmail,
        sender: senderEmail,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('message-prescription-pending', JSON.stringify(message.data));
  }
};

export const membershipEvent = (
  firstName: string | null | undefined,
  email: string | undefined | null,
  membership: string | undefined | null,
  cancel_date: string | undefined | null,
  prescriptions: Record<string, string>[] | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('membership-cancelled', {
      first_name: firstName,
      email,
      membership_name: membership,
      cancel_date,
      prescriptions,
    });
  }
};
export const WeightLossSpanishStartEvent = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  phoneNumber: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('weight-loss-spanish-start', {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
    });
  }
};

export const appointmentMissedEvent = async (
  id: string,
  email: string,
  appointment: IAppointment
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    console.info('missed params', {
      email,
      appointment: JSON.stringify(appointment),
    });
    const missedEvent = await axios.post('https://api.perfalytics.com/track', {
      event: 'appointment-missed',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        appointment_type: appointment.appointment_type,
        status: appointment.status,
        appointment_start_at: appointment.starts_at,
        appointment_end_at: appointment.ends_at,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('appointment-missed', missedEvent.data);
  }
};

export const appointmentFollowUpEvent = async (
  id: string,
  email: string,
  clinician: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const followup = await axios.post('https://api.perfalytics.com/track', {
      event: 'appointment-follow-up-requested',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        clinician,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info(
      'appointment-follow-up-requested',
      JSON.stringify(followup.data)
    );
  }
};

export const prescriptionProcessed = async (
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  medication: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const prescriptionProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'prescription-processed',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          medication: medication,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'prescription-processed',
      JSON.stringify(prescriptionProcessed.data)
    );
  }
};

/**
 *
 * paymentSuccessPrescriptionProcessed is called from the prescriptionPaymentSuccess function and is used to track and email the customer with their prescription details.
 *
 * @param profileId
 * @param email
 * @param orderId
 * @param paymentSucceededAt
 * @param total
 * @param cardBrand
 * @param last4
 * @param medication
 */

export const paymentSuccessPrescriptionProcessed = async (
  profileId: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  paymentSucceededAt: string,
  total: string,
  cardBrand: string | null | undefined,
  last4: string | null | undefined,
  medication: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-prescription-processed',
        properties: {
          distinct_id: profileId,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          last_4: last4,
          card_brand: capitalize(cardBrand),
          payment_succeeded_at: paymentSucceededAt,
          total_charged: total,
          medication: medication,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'payment-success-prescription-processed',
      JSON.stringify(paymentProcessed.data)
    );
  }
};

export const psychiatryRefillCompleted = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const refillCompleted = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'psychiatry-refill-completed',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url:
            'https://app.getzealthy.com/patient-portal/mental-health/refill-request',
        },
      }
    );
    console.info(
      'psychiatry-refill-completed',
      JSON.stringify(refillCompleted.data)
    );
  }
};

export const mentalHealthCoachingBooked = async (
  id: string | null | undefined,
  email: string | null | undefined,
  visit_date: string | null | undefined,
  link: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const refillCompleted = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'mh-coaching-booked',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: 'https://app.getzealthy.com/',
          visit_date: visit_date,
          link: link,
        },
      }
    );
    console.info('mh-coaching-booked', JSON.stringify(refillCompleted.data));
  }
};

export const paymentSuccessVisit = async (
  id: string | null | undefined,
  email: string | null | undefined,
  paymentSucceededAt: string,
  total: string,
  cardBrand: string | null | undefined,
  last4: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-visit',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          last_4: last4,
          card_brand: capitalize(cardBrand),
          payment_succeeded_at: paymentSucceededAt,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'payment-success-visit',
      JSON.stringify(paymentProcessed.data)
    );
  }
};

export const paymentSuccessWeightLossSubscription = async (
  profileId: string | null | undefined,
  email: string | null | undefined,
  paymentSucceededAt: string,
  total: string,
  cardBrand: string | null | undefined,
  last4: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-weight-loss-subscription',
        properties: {
          distinct_id: profileId,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          last_4: last4,
          card_brand: capitalize(cardBrand),
          payment_succeeded_at: paymentSucceededAt,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(
      'payment-success-weight-loss-subscription',
      JSON.stringify(paymentProcessed.data)
    );
  }
};

export const paymentSuccessMentalHealthCoaching = async (
  id: string | null | undefined,
  email: string | null | undefined,
  paymentSucceededAt: string,
  total: string,
  cardBrand: string | null | undefined,
  last4: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-mental-health-coaching',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          last_4: last4,
          card_brand: capitalize(cardBrand),
          payment_succeeded_at: paymentSucceededAt,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'payment-success-mental-health-coaching',
      JSON.stringify(paymentProcessed.data)
    );
  }
};

export const paymentSuccessPsychiatry = async (
  id: string | null | undefined,
  email: string | null | undefined,
  paymentSucceededAt: string,
  total: string,
  cardBrand: string | null | undefined,
  last4: string | null | undefined,
  providerName: string | null | undefined,
  providerEmail: string | null | undefined,
  providerNpi: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-psychiatry',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          last_4: last4,
          card_brand: capitalize(cardBrand),
          payment_succeeded_at: paymentSucceededAt,
          total_charged: total,
          provider_name: providerName,
          provider_email: providerEmail,
          provider_npi: providerNpi,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'payment-success-psychiatry',
      JSON.stringify(paymentProcessed.data)
    );
  }
};

export const paymentSuccessAMH = async (
  email: string | null | undefined,
  total: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window?.freshpaint?.track('payment-success-amh', {
      email: email,
      total_charged: total,
    });
  }
};

export const paymentSuccessMissedVisitFee = async (
  id: string | null | undefined,
  email: string | null | undefined,
  paymentSucceededAt: string,
  total: string,
  cardBrand: string | null | undefined,
  last4: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-missed-visit-fee',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          last_4: last4,
          card_brand: capitalize(cardBrand),
          payment_succeeded_at: paymentSucceededAt,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'payment-success-missed-visit-fee',
      JSON.stringify(paymentProcessed.data)
    );
  }
};

export const prescriptionShipped = async (
  profileId: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  medication: string | null | undefined,
  tracking_number: string | null | undefined,
  tracking_url: string | null | undefined,
  address1: string | null | undefined,
  address2: string | null | undefined,
  city: string | null | undefined,
  state: string | null | undefined,
  zip_code: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    try {
      const delay = Math.floor(Math.random() * 800) + 200;
      await new Promise(resolve => setTimeout(resolve, delay));

      const prescriptionShipped = await axios.post(
        'https://api.perfalytics.com/track',
        {
          event: 'prescription-shipped',
          properties: {
            distinct_id: profileId,
            email: email,
            token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
            time: getUnixTime(new Date()),
            order_id: orderId,
            medication: medication,
            tracking_number,
            tracking_url,
            address1,
            address2,
            city,
            state,
            zip_code,
            $user_agent:
              'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
            $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
          },
        }
      );
      console.log(
        'Event "prescription-shipped" fired successfully:',
        prescriptionShipped.data
      );
    } catch (error) {
      console.error('Error firing "prescription-shipped" event:', error);
    }
  } else {
    console.log(
      'Event "prescription-shipped" not fired because environment is not production'
    );
  }
};

export const prescriptionEnded = async (
  id: string | null | undefined,
  email: string | null | undefined,
  medication: string | null | undefined,
  daysLeft: number | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const ended = await axios.post('https://api.perfalytics.com/track', {
      event: 'prescription-ended',
      properties: {
        distinct_id: id,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        email: email,
        medication,
        days_left: daysLeft,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('prescription-ended', JSON.stringify(ended.data));
  }
};

export const prescriptionDelivered = async (
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  medication: string | null | undefined,
  tracking_number: string | null | undefined,
  address1: string | null | undefined,
  address2: string | null | undefined,
  city: string | null | undefined,
  state: string | null | undefined,
  zip_code: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const prescriptionDelivered = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'prescription-delivered',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          medication: medication,
          tracking_number,
          address1,
          address2,
          city,
          state,
          zip_code,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'prescription-delivered',
      JSON.stringify(prescriptionDelivered.data)
    );
  }
};

export const prescriptionDeliveredTMC = async (
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  medication: string | null | undefined,
  tracking_number: string | null | undefined,
  address1: string | null | undefined,
  address2: string | null | undefined,
  city: string | null | undefined,
  state: string | null | undefined,
  zip_code: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const prescriptionDelivered = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'prescription-delivered-tmc',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          medication: medication,
          tracking_number,
          address1,
          address2,
          city,
          state,
          zip_code,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'prescription-delivered-tmc',
      JSON.stringify(prescriptionDelivered.data)
    );
  }
};

export const paymentRejected = async (
  id: string | null | undefined,
  email: string | null | undefined,
  last4: string | null | undefined,
  portalUrl: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const failed = await axios.post('https://api.perfalytics.com/track', {
      event: 'payment-failed',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        last_4: last4,
        portal_url: portalUrl,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('payment-failed', JSON.stringify(failed.data));
  }
};

export const patientJoiningRoomEvent = async (
  clinician_email: string,
  clinician_phone_number: string,
  room_id: string,
  patient_id: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    await window.freshpaint?.track('patient-joining-room', {
      clinician_phone_number,
      room_id,
      email: clinician_email,
      patient: patient_id,
    });
  }
};

export const patientAwaitingIlvEvent = async (
  clinician_phone_number: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('patient-awaiting-ilv', {
      clinician_phone_number,
    });
  }
  console.log('PATIENT JOINED ROOM');
  const url = '/api/twilio/patient-joined-room';
  const body = { phoneNumber: clinician_phone_number };
  await axios.post(url, body);
};

export const prescriptionSubmittedLocalPharmacy = async (
  id: string | null | undefined,
  email: string | null | undefined,
  medication?: string | null,
  pharmacy?: string | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const localPharm = await axios.post('https://api.perfalytics.com/track', {
      event: 'prescription-submitted-local-pharmacy',
      properties: {
        distinct_id: id,
        email: email,
        medication: medication,
        pharmacy: pharmacy,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info(
      'prescription-submitted-local-pharmacy',
      JSON.stringify(localPharm.data)
    );
  }
};

export const psychiatryProviderFollowup = async (
  id: string | null | undefined,
  email: string | null | undefined,
  startsAt: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const event = await axios.post('https://api.perfalytics.com/track', {
      event: 'psychiatry-follow-up',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        appointment_start_at: startsAt,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.info('psychiatry-follow-up', JSON.stringify(event.data));
  }
};

export const prescriptionWeightLossCompoundEnded = async (
  id: string | null | undefined,
  email: string | null | undefined,
  medication: string | null | undefined,
  daysLeft: number | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const ended = await axios.post('https://api.perfalytics.com/track', {
      event: 'compound-weight-loss-prescription-ended',
      properties: {
        distinct_id: id,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        email: email,
        medication,
        days_left: daysLeft,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(ended.data, 'prescriptionShippedEvent');
  }
};

export const weightLossScheduledForCancelationEvent = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const scheduledForCancelation = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'weight-loss-scheduled-for-cancellation',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(scheduledForCancelation.data, 'prescriptionShippedEvent');
  }
};

export const weightLossScheduledForCancelationDiscountEvent = async (
  id: string | null | undefined,
  email: string | null | undefined,
  applied: boolean = false
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    await axios.post('https://api.perfalytics.com/track', {
      event: applied
        ? 'wl-reactivated-discount-applied'
        : 'wl-scheduled-for-cancellation-discount',
      properties: {
        distinct_id: id,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        email: email,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
  }
};

export const weightLossCancelationEvent = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const cancelationEvent = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'weight-loss-membership-cancelled',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(cancelationEvent.data, 'canceledWeightLossEvent');
  }
};

export const personalizePsychiatryScheduledForCancelationEvent = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const cancelationEvent = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'personalized-psychiatry-scheduled-for-cancellation',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(cancelationEvent.data, 'cancelScheduledPsychiatryEvent');
  }
};

export const personalizePsychiatryCancelationEvent = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const cancelationEvent = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'personalized-psychiatry-membership-cancelled',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(cancelationEvent.data, 'canceledPsychiatryEvent');
  }
};

export const mhCoachingScheduledForCancelationEvent = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const cancelationEvent = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'mh-coaching-scheduled-for-cancellation',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(cancelationEvent.data, 'cancelScheduledPsychiatryEvent');
  }
};

export const mhCoachingCancelationEvent = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const cancelationEvent = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'mh-coaching-membership-cancelled',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(cancelationEvent.data, 'canceledPsychiatryEvent');
  }
};

export const medicationScheduledForCancelationEvent = async (
  id: string | null | undefined,
  email: string | null | undefined,
  type: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const cancelationEvent = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'medication-subscription-scheduled-for-cancellation',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          medication_type: type,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(cancelationEvent.data, 'canceledPsychiatryEvent');
  }
};

export const medicationCancelationEvent = async (
  id: string | null | undefined,
  email: string | null | undefined,
  type: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const cancelationEvent = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'medication-subscription-membership-cancelled',
        properties: {
          distinct_id: id,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          email: email,
          medication_type: type,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(cancelationEvent.data, 'canceledPsychiatryEvent');
  }
};

export const paymentSuccessPrescriptionProcessedGLP1 = async (
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  paymentSucceededAt: string,
  total: string | number,
  cardBrand: string | null | undefined,
  last4: string | null | undefined,
  days_left: number | null | undefined,
  pharmacy: string | null | undefined,
  has_216?: boolean | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-prescription-processed-GLP1',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          last_4: last4,
          days_left,
          card_brand: cardBrand ? capitalize(cardBrand!) : undefined,
          payment_succeeded_at: paymentSucceededAt,
          pharmacy,
          total_charged: total,
          subscription_charge_included: has_216 || null,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(paymentProcessed.data, 'prescriptionProcessed');
  }
};

export const paymentSuccessPrescriptionProcessedGLP16Months = async (
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  paymentSucceededAt: string,
  total: string | number,
  cardBrand: string | null | undefined,
  last4: string | null | undefined,
  days_left: number | null | undefined,
  pharmacy: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-prescription-processed-GLP1-6months',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          last_4: last4,
          days_left,
          card_brand: cardBrand ? capitalize(cardBrand!) : undefined,
          payment_succeeded_at: paymentSucceededAt,
          pharmacy,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(paymentProcessed.data, 'prescriptionProcessed6Months');
  }
};

export const paymentSuccessPrescriptionProcessedGLP112Months = async (
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  paymentSucceededAt: string,
  total: string | number,
  cardBrand: string | null | undefined,
  last4: string | null | undefined,
  days_left: number | null | undefined,
  pharmacy: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentProcessed = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-prescription-processed-GLP1-12months',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          last_4: last4,
          days_left,
          card_brand: cardBrand ? capitalize(cardBrand!) : undefined,
          payment_succeeded_at: paymentSucceededAt,
          pharmacy,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(paymentProcessed.data, 'prescriptionProcessed12Months');
  }
};

export const weightLossCoachingOnlyOffer = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const event = await axios.post('https://api.perfalytics.com/track', {
      event: 'weight-loss-coaching-only-offer',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(event.data, 'weightLossCoachingOnlyOffer');
  }
};

export const weightLossCoachingOnly = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const event = await axios.post('https://api.perfalytics.com/track', {
      event: 'weight-loss-coaching-only',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(event.data, 'weightLossCoachingOnly');
  }
};

export const nonbundledIncompleteRequestCompoundGLP1 = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const event = await axios.post('https://api.perfalytics.com/track', {
      event: 'nonbundled-incomplete-request-compound-glp1',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(event.data, 'nonbundledIncompleteRequestCompoundGLP1');
  }
};

export const nonbundledRequestedCompoundGLP1 = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const event = await axios.post('https://api.perfalytics.com/track', {
      event: 'nonbundled-requested-compound-glp1',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(event.data, 'nonbundledRequestedCompoundGLP1');
  }
};

export const prescriptionRequestedEvent = async (
  email: string,
  medication: string,
  interval: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track(
      siteName === 'Zealthy'
        ? 'prescription-requested'
        : 'prescription-requested-zp',
      {
        email,
        medication,
        interval,
      }
    );
  }
};
export const PurchaseOpipEvent = async (
  email: string,
  medication: string,
  interval: string,
  isBundled: boolean
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track(
      isBundled ? 'purchase-opip-bundled' : 'purchase-opip',
      {
        email,
        medication,
        interval,
      }
    );
  }
};
export const PurchaseOpipPostCheckoutEvent = async (
  email: string,
  medication: string,
  interval: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    if (medication.toLowerCase().includes('semaglutide')) {
      window.freshpaint?.track('purchase-opip-s', {
        email,
        medication,
        interval,
      });
    } else if (medication.toLowerCase().includes('tirzepatide')) {
      window.freshpaint?.track('purchase-opip-t', {
        email,
        medication,
        interval,
      });
    }
  }
};
export const prescriptionRequestedFirstTimeEvent = async (
  email: string,
  medication: string,
  interval: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    trackWithDeduplication(
      'prescription-requested-first-time',
      {
        email,
        medication,
        interval,
      },
      60000,
      true
    );
  }
};
export const compoundPrescriptionRequestedEvent = async (
  email: string,
  medication: string,
  interval: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('compound-prescription-requested-first-time', {
      email,
      medication,
      interval,
    });
  }
};
export const prescriptionRequestedReorderMonthlyEvent = async (
  email: string,
  medication: string,
  duration: string,
  dosage: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('prescription-requested-reorder-glp1-monthly', {
      email,
      medication,
      duration,
      dosage,
    });
  }
};

export const prescriptionRequestedReorderQuarterlyEvent = async (
  email: string,
  medication: string,
  duration: string,
  dosage: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('prescription-requested-reorder-glp1-quarterly', {
      email,
      medication,
      duration,
      dosage,
    });
  }
};

export const prescriptionRequestedReorderBundleMonthlyEvent = async (
  email: string,
  medication: string,
  duration: string,
  dosage: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('prescription-refill-glp1-bundled-monthly', {
      email,
      medication,
      duration,
      dosage,
    });
  }
};

export const prescriptionRequestedReorderBundleQuarterlyEvent = async (
  email: string,
  medication: string,
  duration: string,
  dosage: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('prescription-refill-glp1-bundled-quarterly', {
      email,
      medication,
      duration,
      dosage,
    });
  }
};

export const prescriptionRequestedDosageQuarterlyEvent = async (
  email: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('dosage-update-quarterly-submitted', {
      email,
    });
  }
};

export const referralConvertedEvent = async (
  id: string,
  email: string,
  referrer_patient_id: number,
  first_name: string,
  last_name: string,
  state: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'referral-converted',
        properties: {
          distinct_id: id,
          email: email,
          referrer_patient_id,
          first_name,
          last_name,
          state,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info('referral-converted', JSON.stringify(paymentSuccess.data));
  }
};

export function postCheckoutEvent(question_name: string) {
  let event: string = '';
  switch (question_name) {
    case 'WEIGHT_LOSS_CHECKOUT_S_Q1':
      event = 'weight-loss-checkout-success';
      break;
    case 'WEIGHT-LOSS-MEDICAL-A-Q1':
      event = 'weight-loss-post-checkout-questions-start';
      break;
    case 'WEIGHT_L_POST_Q11':
      event = 'weight-loss-post-checkout-questions-journey';
      break;
    case 'LAB-OR-BLOOD-TESTS-A-Q1':
      event = 'weight-loss-post-checkout-lab-or-blood-tests';
      break;
    case 'WEIGHT_LOSS_MEDICAL_HISTORY_Q1':
      event = 'weight-loss-medical-conditions';
      break;
    case 'WEIGHT_L_POST_Q1':
      event = 'weight-loss-surgeries';
      break;
    case 'WEIGHT_L_POST_Q2':
      event = 'weight-loss-kidney';
      break;
    case 'WEIGHT_L_POST_Q3':
      event = 'weight-loss-medications-used';
      break;
    case 'WEIGHT_L_POST_Q4':
      event = 'weight-loss-glp1-taken';
      break;
    case 'WEIGHT_L_POST_Q5':
      event = 'weight-loss-supplements';
      break;
    case 'WEIGHT_L_POST_Q6':
      event = 'weight-loss-depressed';
      break;
    case 'WEIGHT_L_POST_Q7':
      event = 'weight-loss-vomit';
      break;
    case 'WEIGHT_L_POST_Q8':
      event = 'weight-loss-recommended-dose';
      break;
    case 'WEIGHT_L_POST_Q9':
      event = 'weight-loss-fast';
      break;
    case 'WEIGHT_L_POST_Q10':
      event = 'weight-loss-program';
      break;
    case 'WEIGHT_L_POST_Q12':
      event = 'weight-loss-previously-tried';
      break;
    case 'WEIGHT_L_POST_Q13':
      event = 'weight-loss-race';
      break;
    case 'WEIGHT-LOSS-PREFERENCE-A-Q1':
      event = 'weight-loss-rx-preferences';
      break;
    case 'WEIGHT-LOSS-PAY-A-Q1':
      event = 'weight-loss-glp1-shipped';
      break;
    case 'WEIGHT-LOSS-TREATMENT-A-Q1':
      event = 'weight-loss-semaglutide-tirzepatide';
      break;
    case 'WEIGHT_LOSS_BOR-Q1':
      event = 'weight-loss-bill-of-rights';
      break;
    default:
      break;
  }
  if (event) {
    trackWithDeduplication(event);
  }
}

export const processQuarterlyRedRockSecondShipment = async (
  profileId: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  paymentSucceededAt: string,
  total: string,
  days_left: number | null | undefined,
  pharmacy: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'rr-quarterly-second-shipment-processed',
        properties: {
          distinct_id: profileId,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          days_left,
          payment_succeeded_at: paymentSucceededAt,
          pharmacy,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'rr-quarterly-second-shipment-processed',
      JSON.stringify(paymentSuccess.data)
    );
  }
};

export const processQuarterlyRedRockThirdShipment = async (
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  paymentSucceededAt: string,
  total: string,
  days_left: number | null | undefined,
  pharmacy: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'rr-quarterly-third-shipment-processed',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          days_left,
          payment_succeeded_at: paymentSucceededAt,
          pharmacy,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'rr-quarterly-third-shipment-processed',
      JSON.stringify(paymentSuccess.data)
    );
  }
};

export const processQuarterlyEmpowerSecondShipment = async (
  id: string | null | undefined,
  email: string | null | undefined,
  orderId: number | null | undefined,
  paymentSucceededAt: string,
  total: string,
  days_left: number | null | undefined,
  pharmacy: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'quarterly-order-second-shipment-processed',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          order_id: orderId,
          days_left,
          payment_succeeded_at: paymentSucceededAt,
          pharmacy,
          total_charged: total,
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'quarterly-order-second-shipment-processed',
      JSON.stringify(paymentSuccess.data)
    );
  }
};

export const paApprovedTwoMonths = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'pa-approved-2-months-paid',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'pa-approved-2-months-paid',
      JSON.stringify(paymentSuccess.data)
    );
  }
};

export const paApprovedSixMonths = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'pa-approved-6-months-paid',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'pa-approved-6-months-paid',
      JSON.stringify(paymentSuccess.data)
    );
  }
};

export const bundleCompletedRefill = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'bundle-completed-refill',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'bundle-completed-refill',
      JSON.stringify(paymentSuccess.data)
    );
  }
};

export const tirzepatideFullRefundEvent = async (
  email: string,
  first_name: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('tirzepatide-full-refund', {
      email,
      first_name,
    });
  }
};

export const switchToSemaglutideEvent = async (
  email: string,
  first_name: string,
  refund_amount: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('switched-to-semaglutide', {
      email,
      first_name,
      refund_amount,
    });
  }
};

export const switchToSemaglutideBundledEvent = async (
  email: string,
  first_name: string,
  refund_amount: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('switched-to-semaglutide-bundled', {
      email,
      first_name,
      refund_amount,
    });
  }
};

export const refundIssuedEvent = async (
  id: string,
  email: string,
  dateIssued: string,
  refundAmount: number,
  last4?: string | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const refundIssued = await axios.post('https://api.perfalytics.com/track', {
      event: 'refund-issued',
      properties: {
        distinct_id: id,
        email: email,
        refund_amount: refundAmount,
        date_issued: dateIssued,
        last4,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(JSON.stringify(refundIssued.data));
  }
};

export const allOptionsColoradoEvent = async (
  email: string,
  first_name: string,
  last_name: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('semaglutide-tirzepatide-all-options-colorado', {
      email,
      first_name,
      last_name,
    });
  }
};

export const choseSemaglutideColoradoEvent = async (
  email: string,
  first_name: string,
  last_name: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('chose-semaglutide-colorado', {
      email,
      first_name,
      last_name,
    });
  }
};

export const purchasedSemaglutideColoradoEvent = async (
  email: string,
  first_name: string,
  last_name: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('purchased-semaglutide-colorado', {
      email,
      first_name,
      last_name,
    });
  }
};

export const choseTirzepatideColoradoEvent = async (
  email: string,
  first_name: string,
  last_name: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('chose-tirzepatide-colorado', {
      email,
      first_name,
      last_name,
    });
  }
};

export const purchasedTirzepatideColoradoEvent = async (
  email: string,
  first_name: string,
  last_name: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('purchased-tirzepatide-colorado', {
      email,
      first_name,
      last_name,
    });
  }
};

export const insuranceInformationUpdatedAsync = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const insuranceInfoUpdated = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'insurance-information-updated',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.log(JSON.stringify(insuranceInfoUpdated.data));
  }
};

export const insuranceInformationUpdated = (
  id: string | null,
  email: string | null
) => {
  window?.freshpaint?.track('insurance-information-updated', {
    distinct_id: id,
    email,
    token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
    $user_agent:
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
    $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
  });
};

export const uniquePurchaseEvent = (
  eventName: string,
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  birth_date: string,
  gender: string,
  specificCare: SpecificCareOption,
  careSelections: string,
  calculatedSpecificCare: SpecificCareOption,
  potentialInsurance: PotentialInsuranceOption,
  variant?: string,
  medication?: Medication
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    ['Mental health']?.includes(specificCare)
      ? null
      : window.freshpaint?.track(eventName, {
          email,
          phone,
          first_name,
          last_name,
          state,
          birth_date,
          gender,
          care_selection:
            specificCare === 'Hair Loss' ||
            calculatedSpecificCare === 'Hair Loss' ||
            careSelections === 'Hair Loss'
              ? 'Hair loss'
              : specificCare === 'Sex + Hair' ||
                calculatedSpecificCare === 'Sex + Hair' ||
                careSelections === 'Sex + Hair'
              ? 'Sex + Hair'
              : specificCare || calculatedSpecificCare,
          care_type:
            specificCare === 'Hair Loss' ||
            calculatedSpecificCare === 'Hair Loss' ||
            careSelections === 'Hair Loss'
              ? 'female hair loss'
              : specificCare === 'Hair loss'
              ? 'Hair loss men'
              : variant && variant.includes('5674')
              ? mapVariantToCareType[variant!]
              : specificCare,
        });
    // Specific ED medication purchase-event
    eventName === 'purchase-success-ed'
      ? window.freshpaint?.track(
          medication?.name.toLowerCase().includes('hardies')
            ? 'purchase-success-ed-hardies'
            : 'purchase-success-ed-classic',
          {
            email,
            phone,
            first_name,
            last_name,
            state,
            birth_date,
            gender,
            care_selection: specificCare || calculatedSpecificCare,
            care_type: specificCare,
            value: careToValue(
              specificCare || calculatedSpecificCare,
              potentialInsurance,
              '',
              medication
            ),
          }
        )
      : null;

    eventName === 'purchase-sex-hair'
      ? window.freshpaint?.track('purchase-sex-hair', {
          id,
          email,
          phone,
          first_name,
          last_name,
          state,
          birth_date,
          gender,
          care_selection: specificCare || calculatedSpecificCare,
          care_type: specificCare,
          value: careToValue(
            specificCare || calculatedSpecificCare,
            potentialInsurance,
            '',
            medication
          ),
        })
      : null;
    eventName === 'purchase-insomnia'
      ? window.freshpaint?.track('purchase-insomnia', {
          id,
          email,
          phone,
          first_name,
          last_name,
          state,
          birth_date,
          gender,
          care_selection: specificCare || calculatedSpecificCare,
          care_type: specificCare,
          value: careToValue(
            specificCare || calculatedSpecificCare,
            potentialInsurance,
            '',
            medication
          ),
        })
      : null;
    eventName === 'purchase-success-female-hl'
      ? window.freshpaint?.track('purchase-success-female-hl', {
          id,
          email,
          phone,
          first_name,
          last_name,
          state,
          birth_date,
          gender,
          care_selection: specificCare || calculatedSpecificCare,
          care_type: specificCare,
          value: careToValue(
            specificCare || calculatedSpecificCare,
            potentialInsurance,
            '',
            medication
          ),
        })
      : null;
    eventName === 'purchase-success-sc'
      ? window.freshpaint?.track('purchase-success-sc', {
          id,
          email,
          phone,
          first_name,
          last_name,
          state,
          birth_date,
          gender,
          care_selection: specificCare || calculatedSpecificCare,
          care_type: specificCare,
          value: careToValue(
            specificCare || calculatedSpecificCare,
            potentialInsurance,
            '',
            medication
          ),
        })
      : null;
    eventName === 'purchase-enclomiphene'
      ? window.freshpaint?.track('purchase-enclomiphene', {
          id,
          email,
          phone,
          first_name,
          last_name,
          state,
          birth_date,
          gender,
          care_selection: specificCare || calculatedSpecificCare,
          care_type: specificCare,
          value: careToValue(
            specificCare || calculatedSpecificCare,
            potentialInsurance,
            '',
            medication
          ),
        })
      : null;

    eventName === 'purchase-menopause'
      ? window.freshpaint?.track('purchase-menopause', {
          id,
          email,
          phone,
          first_name,
          last_name,
          state,
          birth_date,
          gender,
          care_selection: specificCare || calculatedSpecificCare,
          care_type: specificCare,
          value: careToValue(
            specificCare || calculatedSpecificCare,
            potentialInsurance,
            '',
            medication
          ),
        })
      : null;
    // Purchase event for Facebook
    window.freshpaint?.track(
      siteName === 'Zealthy' ? 'Purchase' : 'Purchase-ZPlan',
      {
        email,
        phone,
        first_name,
        last_name,
        state,
        birth_date,
        gender,
        care_selections: careSelections,
        care_selection:
          specificCare === 'Hair Loss' ||
          calculatedSpecificCare === 'Hair Loss' ||
          careSelections === 'Hair Loss' ||
          specificCare === 'Sex + Hair' ||
          calculatedSpecificCare === 'Sex + Hair' ||
          careSelections === 'Sex + Hair'
            ? specificCare
            : specificCare || calculatedSpecificCare,
        care_type:
          specificCare === 'Hair Loss' ||
          calculatedSpecificCare === 'Hair Loss' ||
          careSelections === 'Hair Loss'
            ? 'female hair loss'
            : specificCare === 'Hair loss'
            ? 'Hair loss men'
            : specificCare === 'Sex + Hair'
            ? 'Sex + Hair'
            : variant && variant.includes('5674')
            ? mapVariantToCareType[variant!]
            : specificCare,
        content_name: calculatedSpecificCare,
        value: careToValue(
          specificCare || calculatedSpecificCare,
          potentialInsurance,
          '',
          medication
        ),
        currency: 'USD',
      }
    );
    window.VWO?.event('Purchase');
    window.freshpaint?.identify(id, {
      email,
      converted: true,
      converted_at: new Date().toISOString(),
      converted_care_selection:
        specificCare === 'Hair Loss' ||
        calculatedSpecificCare === 'Hair Loss' ||
        careSelections === 'Hair Loss' ||
        specificCare === 'Sex + Hair' ||
        calculatedSpecificCare === 'Sex + Hair' ||
        careSelections === 'Sex + Hair'
          ? specificCare
          : specificCare || calculatedSpecificCare,
      converted_care_type: potentialInsurance
        ? potentialInsurance
        : specificCare === 'Hair Loss' ||
          calculatedSpecificCare === 'Hair Loss' ||
          careSelections === 'Hair Loss'
        ? 'female hair loss'
        : specificCare === 'Hair loss'
        ? 'Hair loss men'
        : specificCare,
    });
  }
  window.STZ?.trackEvent('Purchase');
};

export const weightLossDiscountCodeApplied = async (
  id: string | null | undefined,
  email: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSuccess = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'weight-loss-discount-code',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        },
      }
    );
    console.info(
      'weight-loss-discount-code',
      JSON.stringify(paymentSuccess.data)
    );
  }
};

export const trustpilotReviewReceivedEvent = async (
  source: string,
  rating: number,
  name: string,
  date: string,
  email: string | null | undefined,
  id: string | null | undefined
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const trustpilotReviewReceived = await axios
      .post('https://api.perfalytics.com/track', {
        event: 'trustpilot-review-received',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
          collection_method: source,
          rating: rating,
          name: name,
          date: date,
        },
      })
      .catch(error => {
        console.error('Error firing trustpilot event', error);
      });
    console.info(
      'trustpilot-review-received',
      JSON.stringify(trustpilotReviewReceived)
    );
  }
};

export const birthControlPaymentEvent = async (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  birth_date: string,
  gender: string,
  value: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentBC = await axios.post('https://api.perfalytics.com/track', {
      event: 'payment-bc',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        phone: phone,
        first_name: first_name,
        last_name: last_name,
        state: state,
        birth_date: birth_date,
        gender: gender,
        value: value,
      },
    });
    console.log(JSON.stringify(paymentBC.data));
  }
};

export const enclomiphenePaymentEvent = async (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  birth_date: string,
  gender: string,
  value: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentEnc = await axios.post('https://api.perfalytics.com/track', {
      event: 'payment-success-enclomiphene',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        phone: phone,
        first_name: first_name,
        last_name: last_name,
        state: state,
        birth_date: birth_date,
        gender: gender,
        value: value,
      },
    });
    console.log(JSON.stringify(paymentEnc.data));
  }
};

export const primaryCarePaymentEvent = async (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  birth_date: string,
  gender: string,
  value: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentPrimaryCare = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-primary-care',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
          phone: phone,
          first_name: first_name,
          last_name: last_name,
          state: state,
          birth_date: birth_date,
          gender: gender,
          value: value,
        },
      }
    );
    console.log(JSON.stringify(paymentPrimaryCare.data));
  }
};

export const menopausePaymentEvent = async (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  birth_date: string,
  gender: string,
  value: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentMenopause = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-success-menopause',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
          phone: phone,
          first_name: first_name,
          last_name: last_name,
          state: state,
          birth_date: birth_date,
          gender: gender,
          value: value,
        },
      }
    );
    console.log(JSON.stringify(paymentMenopause.data));
  }
};

export const sexHairPaymentEvent = async (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  birth_date: string,
  gender: string,
  value: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const paymentSexHair = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'payment-sex-hair',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
          phone: phone,
          first_name: first_name,
          last_name: last_name,
          state: state,
          birth_date: birth_date,
          gender: gender,
          value: value,
        },
      }
    );
    console.log(JSON.stringify(paymentSexHair.data));
  }
};

export const automatedCallFailedPaymentEvent = async (
  id: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  birth_date: string,
  gender: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const autoCallFailedPay = await axios.post(
      'https://api.perfalytics.com/track',
      {
        event: 'automated-call-failed-payment ',
        properties: {
          distinct_id: id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: getUnixTime(new Date()),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: 'https://app.getzealthy.com',
          phone: phone,
          first_name: first_name,
          last_name: last_name,
          state: state,
          birth_date: birth_date,
          gender: gender,
        },
      }
    );
    console.log(JSON.stringify(autoCallFailedPay.data));
  }
};

export const rateSyncVisitEvent = async (
  id: string,
  email: string,
  rating: number
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const event = await axios.post('https://api.perfalytics.com/track', {
      event: 'rate-synch-visit',
      properties: {
        distinct_id: id,
        email: email,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
        rating,
      },
    });
    console.log(JSON.stringify(event.data));
  }
};

export const paApprovedWeightLoss = async (
  patientId: string | undefined | null,
  patientEmail: string | undefined | null,
  rxSubmitted: string | undefined | null,
  priorAuthId: number | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'pa-approved',
      properties: {
        distinct_id: patientId,
        email: patientEmail,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        medication: rxSubmitted,
        prior_auth_id: priorAuthId,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(message.data);
  }
};

export const uniquePaymentSuccess = async (
  id: string,
  patientEmail: string | undefined | null,
  eventName: string,
  medication?: string | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const event = await axios.post('https://api.perfalytics.com/track', {
      event: eventName,
      properties: {
        distinct_id: id,
        email: patientEmail,
        medication: medication,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(event.data);
  }
};

// Can be refactored to one and pass in Thumbs Up or Thumbs Down but asked for two events
export const thumbsUpOnMessageEvent = async (
  patientEmail: string | undefined | null,
  careTeamGroupName: string | undefined | null,
  senderId: string | undefined | null,
  senderName: string | undefined | null,
  senderType: string | undefined | null,
  messageId: string | undefined | null,
  message: string | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('thumbs-up-on-message', {
      patientEmail,
      careTeamGroupName,
      senderId,
      senderName,
      senderType,
      messageId,
      message,
    });
  } else {
    console.log(`
      thumbsUpOnMessageEvent
      PatientEmail: ${patientEmail}
      GroupName: ${careTeamGroupName}
      senderId: ${senderId}
      senderName: ${senderName}
      senderType: ${senderType}
      messageId: ${messageId}
      message: ${message}
    `);
  }
};

export const thumbsDownOnMessageEvent = async (
  patientEmail: string | undefined | null,
  careTeamGroupName: string | undefined | null,
  senderId: string | undefined | null,
  senderName: string | undefined | null,
  senderType: string | undefined | null,
  messageId: string | undefined | null,
  message: string | undefined | null
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    window.freshpaint?.track('thumbs-down-on-message', {
      patientEmail,
      careTeamGroupName,
      senderId,
      senderName,
      senderType,
      messageId,
      message,
    });
  } else {
    console.log(`
      thumbsDownOnMessageEvent
      PatientEmail: ${patientEmail}
      GroupName: ${careTeamGroupName}
      senderId: ${senderId}
      senderName: ${senderName}
      senderType: ${senderType}
      messageId: ${messageId}
      message: ${message}
    `);
  }
};

export const prescriptionRenewalEvent = async (
  patientProfileId: string,
  patientEmail: string,
  care: string,
  medication: string,
  link: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'non-wl-renewal-start',
      properties: {
        distinct_id: patientProfileId,
        email: patientEmail,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        care: care,
        medication: medication,
        link: link,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(message.data);
  }
};

export const prescriptionRenewalFinishedEvent = async (
  patientProfileId: string,
  patientEmail: string,
  care: string,
  medication: string
) => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    siteName === 'Zealthy'
  ) {
    const message = await axios.post('https://api.perfalytics.com/track', {
      event: 'non-wl-renewal-finished',
      properties: {
        distinct_id: patientProfileId,
        email: patientEmail,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        time: getUnixTime(new Date()),
        care: care,
        medication: medication,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
      },
    });
    console.log(message.data);
  }
};
