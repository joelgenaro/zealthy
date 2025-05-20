import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { usePatient } from './data';
import axios from 'axios';
import { usePayment } from './usePayment';
import { generateReferralCode } from '@/utils/generateReferralCode';
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { useApi } from '@/context/ApiContext';
import { Endpoints } from '@/types/endpoints';
import { UpdateAddressParams } from '@/pages/api/service/address/update';
import normalizePhoneNumber from '@/utils/phone/normalizePhoneNumber';
import { validatePhoneNumber } from '@/utils/phone/validatePhoneNumber';

type PatientUpdateInput = Database['public']['Tables']['patient']['Update'];

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation(
    async (data: any) => {
      const res = await axios.post(`/api/message`, data).catch(e => {
        toast.error('An error occured', {
          position: 'bottom-center',
          style: { marginBottom: '50px' },
          duration: 800,
        });
      });

      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('messagesByGroup');
      },
      onError: () => {
        toast.error('There was an error updating your information');
      },
    }
  );
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();

  return useMutation(
    async (data: PatientUpdateInput) => {
      return supabase.from('patient').update(data).eq('id', patient?.id!);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patient');
      },
      onError: () => {
        toast.error('There was an error updating your information');
      },
    }
  );
}

type ProfileUpdateInput = Database['public']['Tables']['profiles']['Update'];

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();

  return useMutation(
    async (data: ProfileUpdateInput) => {
      data.phone_number = normalizePhoneNumber(data.phone_number);
      if (!validatePhoneNumber(data.phone_number)) {
        delete data.phone_number;
      }

      const result = await supabase
        .from('profiles')
        .update(data)
        .eq('id', patient?.profile_id!);

      return result.data;
    },
    {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        queryClient.invalidateQueries('patient');
      },
      onError: () => {
        toast.error('There was an error updating your profile');
      },
    }
  );
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation(
    async (data: UpdateAddressParams) => {
      const inputsToUpper = [
        'address_line_1',
        'address_line_2',
        'city',
        'state',
      ] as (keyof Pick<
        UpdateAddressParams,
        'address_line_1' | 'address_line_2' | 'city' | 'state'
      >)[];
      for (const input of inputsToUpper) {
        data[input] = data[input].toUpperCase().trim();
      }

      return api.post<Database['public']['Tables']['address']['Row']>(
        Endpoints.UPDATE_ADDRESS,
        data
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patientAddress');
        queryClient.invalidateQueries('patient');
        window?.freshpaint?.track('address-verified');
      },
      onError: () => {
        toast.error('There was an error updating your address');
      },
    }
  );
}

export function useUpdatePassword() {
  const supabase = useSupabaseClient<Database>();

  return useMutation(
    async (data: { new_password: string; confirm_password: string }) => {
      const result = await supabase.auth.updateUser({
        password: data?.new_password,
      });
      return result.data?.user;
    },
    {
      onSuccess: () => {
        toast.success('Password updated');
      },
      onError: () => {
        toast.error('There was a problem updating your password');
      },
    }
  );
}

export function useReactivateSubscription() {
  const { reactivateSubscription } = usePayment();
  const queryClient = useQueryClient();

  return useMutation(
    async (subscriptionId: string) => {
      const { data } = await reactivateSubscription(subscriptionId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allPatientSubscription');
      },
      onError: () => {
        toast.error('There was a problem updating subscription');
      },
    }
  );
}

export function useRenewSubscription() {
  const { renewSubscription } = usePayment();
  const queryClient = useQueryClient();

  return useMutation(
    async (params: any) => {
      let subscription, coupon;
      // Check if params is an object with 'subscription' property or just a single subscription object
      if (params.subscription) {
        // If params has a 'subscription' property, destructure it
        ({ subscription, coupon } = params);
      } else {
        // Otherwise, treat params as the subscription object
        subscription = params;
      }

      const { data } = await renewSubscription(
        {
          id: subscription.id ?? subscription?.subscription?.id,
          planId:
            subscription?.subscription?.reference_id ??
            params.subscription.reference_id,
          reference_id: params.reference_id ?? subscription.reference_id,
        },
        coupon
      );

      return data;
    },
    {
      onSuccess: () => {
        toast.success('Subscription created');
        queryClient.invalidateQueries('allPatientSubscription');
      },
      onError: () => {
        toast.error('There was a problem updating subscription');
      },
    }
  );
}

export function useRenewPrescription() {
  const { renewPrescription } = usePayment();
  const queryClient = useQueryClient();
  return useMutation(
    async (subscription: any) => {
      const { data } = await renewPrescription({
        id: subscription.id,
        planId: subscription.reference_id,
        reference_id: subscription.reference_id,
      });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allPatientSubscription');
      },
      onError: () => {
        toast.error('There was a problem updating subscription');
      },
    }
  );
}

export function useAddWeightLog() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();
  const pathname = usePathname();

  return useMutation(
    async (data: {
      weight: number;
      patient_id?: number;
      date_logged: string;
    }) => {
      console.info('useAddWeightLog --logging weight');
      // check if log for this date exists
      const { data: existingLog } = await supabase
        .from('patient_weight')
        .select('*')
        .eq('patient_id', data.patient_id!);

      if (existingLog?.length) {
        // check if log for this date exists
        const existing = existingLog.find(log => {
          return (
            format(new Date(data.date_logged), 'MM/dd/yyyy') ===
            format(new Date(log?.date_logged!), 'MM/dd/yyyy')
          );
        });

        if (existing) {
          return supabase
            .from('patient_weight')
            .update({
              weight: data.weight,
            })
            .eq('id', existing.id);
        }
      }

      return supabase.from('patient_weight').insert(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patientWeightLogs');
      },
      onError: () => {
        console.error('Failed to add weight log');
      },
    }
  );
}

export function useUpdateWeightLog() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();

  return useMutation(
    async (data: { id: number; weight: number; date_logged: string }) => {
      const params = {
        weight: data.weight,
        date_logged: data.date_logged,
      };

      return supabase.from('patient_weight').update(params).eq('id', data?.id);
    },
    {
      onSuccess: () => {
        console.log('Weight has been logged');
        queryClient.invalidateQueries('patientWeightLogs');
      },
      onError: () => {
        console.error('There was a problem logging your weight');
      },
    }
  );
}

export function useCreateWeightLossReferral() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();

  return useMutation(
    async (data: { patientId: number | undefined | null }) => {
      if (data.patientId) {
        const params = {
          patient_id: data.patientId,
          code: await generateReferralCode(),
          specific_care: 'Weight loss',
        };

        return supabase.from('patient_referral').insert(params);
      }
    },
    {
      onSuccess: () => {
        //toast.success("Weight loss referral code has been created");
        queryClient.invalidateQueries('patientWeightLossReferrals');
      },
      onError: () => {
        //toast.error("There was a problem creating referral code");
        console.log('There was a problem creating referral code');
      },
    }
  );
}

export function useUpdateDefaultPaymentMethod() {
  const queryClient = useQueryClient();
  const { data: patient } = usePatient();
  const { updateDefaultPaymentMethod } = usePayment();

  return useMutation(
    async (data: { paymentMethodId: string }) => {
      const response = await updateDefaultPaymentMethod(
        {
          id: patient!.id,
        },
        data.paymentMethodId
      );

      return response.data;
    },
    {
      onSuccess: () => {
        // toast.success("Default payment method updated");
        queryClient.invalidateQueries('patientDefaultPaymentMethod');
      },
    }
  );
}

export function useUpdateOnlineVisit() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();

  return useMutation(
    async (data: {
      visitId: number;
      update: Database['public']['Tables']['online_visit']['Update'];
    }) => {
      const { data: visit } = await supabase
        .from('online_visit')
        .update(data.update)
        .eq('id', data.visitId);
      return visit;
    },
    {
      onSuccess: () => {
        // toast.success('Visit information has been updated');
        queryClient.invalidateQueries('incompletePatientVisits');
      },
      onError: () => {
        toast.error('There was a problem updating your visit');
      },
    }
  );
}

export function useUpdateMessageHelpful() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();

  return useMutation(
    async (data: { id: number; was_helpful: boolean }) => {
      const messageHelpful = await supabase
        .from('messages-v2')
        .update({ was_helpful: data.was_helpful })
        .eq('id', data.id);

      return messageHelpful;
    },
    {
      onSuccess: () => {
        // queryClient.invalidateQueries("patientMessages");
      },
      onError: () => {
        toast.error('There was a problem updating your message');
      },
    }
  );
}
export function useApplyCouponCode() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();

  return useMutation(
    async (data: { code: string; profile_id: string; redeemed: boolean }) => {
      const appliedCoupon = supabase.from('coupon_code_redeem').insert({
        code: data.code,
        profile_id: data.profile_id,
        redeemed: data?.redeemed,
      });
      return appliedCoupon;
    },
    {
      onSuccess: () => {
        // queryClient.invalidateQueries("patientMessages");
      },
      onError: () => {
        toast.error('There was a problem applying coupon code');
      },
    }
  );
}
export function useRedeemCouponCode() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();

  return useMutation(
    async (data: { id: number; redeemed: boolean }) => {
      const messageHelpful = await supabase
        .from('coupon_code_redeem')
        .update({ redeemed: data?.redeemed })
        .eq('id', data.id);

      return messageHelpful;
    },
    {
      onSuccess: () => {
        // queryClient.invalidateQueries("patientMessages");
      },
      onError: () => {
        toast.error('There was a problem updating your message');
      },
    }
  );
}

export function useCreatePatientTask() {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();

  return useMutation(
    async (data: {
      patient_id: number;
      task_type: string;
      queue_type: string;
      note?: string;
    }) => {
      const createdTask = await supabase.from('task_queue').insert(data);

      return createdTask;
    },
    {
      onSuccess: () => {
        console.log('Successfully created patient task');
      },
      onError: () => {
        toast.error('There was a problem creating patient task');
      },
    }
  );
}

export const useMarkMessagesRead = () => {
  const supabase = useSupabaseClient<Database>();
  const queryClient = useQueryClient();

  return useMutation(
    'useMarkMessagesRead',
    async (data: { messageIds: number[] }) => {
      const markMessagesRead = await supabase
        .from('messages-v2')
        .update({ has_seen: true })
        .in('id', data.messageIds)
        .select();

      return markMessagesRead;
    },
    {
      onSuccess: data => {
        console.log('Successfully marked new messages as read.', data);
        queryClient.invalidateQueries('useHasUnseenMessages');
      },
      onError: () => {
        console.error('Error marking new messages as read.');
      },
    }
  );
};

// updates patient weight_loss_free_month_redeemed to current timestamp
export function useUpdateFreeMonthRedemption() {
  const supabase = useSupabaseClient<Database>();
  const queryClient = useQueryClient();

  return useMutation(
    async (patientId: number) => {
      const { error } = await supabase
        .from('patient')
        .update({
          weight_loss_free_month_redeemed: new Date().toISOString(),
        })
        .eq('id', patientId);

      if (error) {
        throw new Error('Failed to record free month redemption');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['patient']);
        window?.freshpaint?.track('weight-loss-free-month-redeemed');
      },
      onError: (error: any) => {
        console.error('Error updating free month redemption:', error);
      },
    }
  );
}
