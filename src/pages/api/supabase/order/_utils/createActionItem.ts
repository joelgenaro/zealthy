import { Database } from '@/lib/database.types';
import addDays from 'date-fns/addDays';

type ActionItemInsertInput =
  Database['public']['Tables']['patient_action_item']['Insert'];

type CreateDosageUpdateItemParams = {
  patientId: number;
  createdAt: string;
};

export const createDosageUpdateTask = ({
  patientId,
  createdAt,
}: CreateDosageUpdateItemParams): ActionItemInsertInput => {
  return {
    type: 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST',
    patient_id: patientId,
    title: 'Request your weight loss Rx dosage update',
    body: 'You should request your dosage update request before completing your last injection of the previous dosage.',
    path: '/patient-portal/visit/weight-loss-quarterly-checkin',
    is_required: true,
    created_at: createdAt,
  };
};

type CreateBundleRefillTaskParams = {
  patientId: number;
  medication: string;
  createdAt: string;
};

export const createBundleRefillTask = ({
  patientId,
  medication,
  createdAt,
}: CreateBundleRefillTaskParams): ActionItemInsertInput => {
  return {
    type: 'PRESCRIPTION_RENEWAL_REQUEST',
    patient_id: patientId,
    title: `Get prescription renewal to continue getting ${medication}`,
    body: 'You must complete this for your provider to write your prescription, so you can receive your next medication and additional refills.',
    path: '/patient-portal/visit/weight-loss-bundle-reorder',
    is_required: true,
    created_at: createdAt,
  };
};

type CreateRefillTaskParams = {
  patientId: number;
  createdAt: string;
};

export const createRefillTask = ({
  patientId,
  createdAt,
}: CreateRefillTaskParams): ActionItemInsertInput => {
  return {
    type: 'PRESCRIPTION_RENEWAL_REQUEST',
    patient_id: patientId,
    title: 'Request your weight loss Rx refill',
    body: 'You should request your refill about 1 week before your last dose.',
    path: '/patient-portal/visit/weight-loss-refill',
    is_required: true,
    created_at: createdAt,
  };
};

const createActionItem = (
  numberOfOrders: number,
  currentOrder: number,
  bundle: boolean,
  params: any
): ActionItemInsertInput => {
  const createdAt = addDays(
    new Date(),
    30 * (currentOrder - 1) + 28
  ).toISOString();

  if (numberOfOrders === 3) {
    if (currentOrder < 2) {
      //quarterly-checkin
      return createDosageUpdateTask({
        patientId: params.patient_id,
        createdAt,
      });
    }

    if (bundle) {
      //weight-loss-bundle-reorder
      return createBundleRefillTask({
        patientId: params.patient_id,
        medication: params.medication,
        createdAt,
      });
    }
  }

  //weight-loss-refill
  return createRefillTask({
    patientId: params.patient_id,
    createdAt,
  });
};
