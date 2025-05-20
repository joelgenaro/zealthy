import { Invoice } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import isBefore from 'date-fns/isBefore';
import getStripeInstance from '../../../createClient';

async function handleCancelDraftBulkInvoices(
  patientId: number,
  supabase: SupabaseClient<Database>
) {
  const stripe = getStripeInstance();

  try {
    const weightLossSub = await supabase
      .from('patient_subscription')
      .select(`*, subscription (*)`)
      .eq('patient_id', patientId)
      .eq('visible', true)
      .ilike('subscription.name', '%Weight Loss%')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data);

    if (weightLossSub) {
      const currentPeriodEnd = new Date(weightLossSub.current_period_end);
      const thiryFiveDaysFromNow = addDays(new Date(), 35);

      //sub current period end should be ~90 days in the future. If it isn't, it means we still haven't added 2 months to the wl membership's renewal date and must handle the bulk invoice logic here.
      //thirty five is an arbitrary condition because if sub hasn't been updated, the renewal will be the same as original (~30 days in the future)
      if (isBefore(currentPeriodEnd, thiryFiveDaysFromNow)) {
        const draftBulkInvoice: Invoice | null = await supabase
          .from('invoice')
          .select('*')
          .eq('patient_id', patientId)
          .eq('status', 'draft')
          .ilike('description', '%DO NOT CHARGE%')
          .limit(1)
          .maybeSingle()
          .then(({ data }) => data);

        if (draftBulkInvoice?.amount_due) {
          await supabase
            .from('invoice')
            .update({ status: 'void' })
            .eq('reference_id', draftBulkInvoice?.reference_id);

          const trialEnd = addMonths(
            new Date(weightLossSub?.current_period_end || new Date()),
            2
          );

          await axios.post(
            `https://${process.env.VERCEL_URL}/api/service/payment/apply-credit-balance`,
            {
              referenceId: weightLossSub?.reference_id,
              trialEnd,
            }
          );

          await stripe.invoices.del(draftBulkInvoice?.reference_id);

          // make sure to void any excess draft bulk invoices that were created
          const allDraftBulkInvoices = await supabase
            .from('invoice')
            .select('*')
            .eq('patient_id', patientId)
            .eq('status', 'draft')
            .ilike('description', '%DO NOT CHARGE%')
            .then(({ data }) => data?.map(invoice => invoice?.reference_id));

          if (allDraftBulkInvoices?.length) {
            await supabase
              .from('invoice')
              .update({ status: 'void' })
              .in('reference_id', allDraftBulkInvoices)
              .throwOnError();

            await Promise.all(
              allDraftBulkInvoices.map(invoice => stripe.invoices.del(invoice))
            );
          }
        }
      } else {
        return 'Nothing to update';
      }
    }

    return 'Voided all draft bulk invoices';
  } catch (e) {
    console.log({ errorVoidingDraftBulkInvoices: e });
    return `Unable to void invoices for patient: ${patientId} err`;
  }
}

export { handleCancelDraftBulkInvoices };
