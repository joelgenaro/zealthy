import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import { CoachingState } from '@/context/AppContext/reducers/types/coaching';
import { VisitState } from '@/context/AppContext/reducers/types/visit';
import { PurchaseType } from './types';

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
