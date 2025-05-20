import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import { CoachingState } from '@/context/AppContext/reducers/types/coaching';
import { VisitState } from '@/context/AppContext/reducers/types/visit';
import { ulid } from 'ulid';
import { PurchaseType } from './types';
import axios from 'axios';

const recentEvents: Record<string, number> = {};

/**
 * Tracks a specific event with Freshpaint, including a ULID for CustomerIO deduplication.
 * Only deduplicates within a short window for the same user, allowing legitimate repeat events.
 *
 * @param eventName The name of the event to track
 * @param properties Optional event properties
 * @param dedupeWindow Time window in milliseconds to prevent duplicate events (default: 60 seconds)
 * @param isServerEvent Whether this is a server-side event (default: false)
 */
export const trackWithDeduplication = (
  eventName: string,
  properties: Record<string, any> = {},
  dedupeWindow: number = 60000, // 1 minute default for client events
  isServerEvent: boolean = false // Default to false for client events
): void => {
  if (typeof window === 'undefined' || (!isServerEvent && !window.freshpaint))
    return;

  const eventId = ulid();
  const eventProps = { ...properties, id: eventId };

  const now = Date.now();
  const eventKey = eventName;

  if (recentEvents[eventKey] && now - recentEvents[eventKey] < dedupeWindow) {
    return;
  }

  recentEvents[eventKey] = now;

  if (isServerEvent) {
    // For server events, use axios to post to the tracking endpoint
    axios
      .post('https://api.perfalytics.com/track', {
        event: eventName,
        properties: eventProps,
      })
      .catch(err => console.error('Error tracking server event:', err));
  } else {
    // For client events, use freshpaint track call
    window.freshpaint.track(eventName, eventProps);
  }
};

export const mapOrderToPurchase = (
  order: VisitState | null,
  appointment: AppointmentState | null,
  coaching: CoachingState[] | null
) => {
  const purchase: PurchaseType = {
    coaching: null,
    medications: null,
    appointment: null,
  };

  if (order?.medications.length) {
    purchase.medications = order.medications.map(medication => ({
      name: medication.name,
      price: medication.price!,
    }));
  }

  if (coaching) {
    purchase.coaching = coaching.map(coach => ({
      name: coach.name,
      price: coach.price,
    }));
  }

  if (appointment) {
    if (appointment.encounter_type === 'Walked-in') {
      purchase.appointment = {
        type: appointment.encounter_type,
        doctor: null,
        starts_at: null,
        ends_at: null,
      };
    } else {
      purchase.appointment = {
        type: appointment.encounter_type,
        doctor: `${appointment.provider?.first_name} ${appointment.provider?.last_name}`,
        starts_at: appointment.starts_at,
        ends_at: appointment.ends_at,
      };
    }
  }

  return purchase;
};
