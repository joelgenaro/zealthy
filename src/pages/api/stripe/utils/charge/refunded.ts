import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { refundIssuedEvent } from '@/utils/freshpaint/events';
import Stripe from 'stripe';
import getStripeInstance from '../../createClient';
import {
  handleWeightLossRefund,
  extractMonthsFromDescription,
  calculateAdjustedDate,
  updateSubscriptionEndDate,
} from '../subscription/weight-loss-refund';

type Patient = {
  profiles: {
    email: string;
    id: string;
  };
} | null;

const findEmail = async (patientId: number) => {
  return supabaseAdmin
    .from('patient')
    .select('profiles(id, email)')
    .eq('id', patientId)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => ({
      email: (data as Patient)?.profiles?.email,
      id: (data as Patient)?.profiles?.id,
    }));
};

export const manageRefunds = async (charge: Stripe.Charge) => {
  if (!charge?.invoice && !charge?.payment_intent) return;

  const stripe = getStripeInstance();

  try {
    const invoice = await supabaseAdmin
      .from('invoice')
      .update({
        is_refunded: charge.status === 'succeeded',
        refunded_at: new Date().toISOString(),
        amount_refunded: charge.amount_refunded / 100,
      })
      .eq(
        'reference_id',
        charge?.invoice ? charge.invoice : charge.payment_intent!
      )
      .select('*')
      .maybeSingle()
      .throwOnError()
      .then(({ data }) => data);

    if (invoice?.patient_id) {
      const { email, id } = await findEmail(invoice.patient_id);

      if (email) {
        refundIssuedEvent(
          id!,
          email,
          new Date(charge.created * 1000).toISOString(),
          charge.amount_refunded / 100,
          charge.payment_method_details?.card?.last4
        );
      }

      if (
        invoice?.description?.includes('Months Weight Loss') ||
        invoice?.description?.includes('months membership') ||
        (invoice?.description?.includes('Subscription upgrade') &&
          invoice?.description?.toLowerCase()?.includes('weight'))
      ) {
        await handleWeightLossRefund(invoice);
      }
    }
  } catch (err: any) {
    console.error('refunded_err', err);
    throw new Error(
      `Error in charge/refunded: ${JSON.stringify(
        err?.message || 'There was an unexpected error'
      )}`
    );
  }
};

export const handleRefundUpdate = async (refund: Stripe.Refund) => {
  if (!refund?.charge) {
    console.error(
      `handleRefundUpdate called with invalid refund (no charge): ${JSON.stringify(
        refund
      )}`
    );
    return;
  }

  console.info(
    `REFUND_UPDATE_START: Processing refund update: id=${refund.id}, status=${refund.status}, charge=${refund.charge}`
  );

  try {
    console.info(
      `REFUND_UPDATE_STEP: Looking up invoice for charge ${refund.charge}`
    );

    let { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoice')
      .select('*')
      .eq('charge', refund.charge as string)
      .single();

    if (!invoice) {
      console.info(
        `REFUND_UPDATE_STEP: No exact match for charge ${refund.charge}, trying partial match`
      );
      const { data: invoices, error } = await supabaseAdmin
        .from('invoice')
        .select('*')
        .ilike('charge', `%${(refund.charge as string).slice(-10)}%`);

      if (error) {
        console.error(
          `REFUND_UPDATE_ERROR: Error with partial charge search: ${JSON.stringify(
            error
          )}`
        );
      }

      if (invoices && invoices.length > 0) {
        console.info(
          `REFUND_UPDATE_STEP: Found ${invoices.length} possible matches by partial charge ID`
        );
        if (refund.payment_intent) {
          const paymentIntentMatch = invoices.find(
            inv =>
              inv.reference_id === refund.payment_intent ||
              inv.from_payment_intent === refund.payment_intent
          );
          if (paymentIntentMatch) {
            console.info(
              `REFUND_UPDATE_STEP: Found invoice match by payment_intent: ${paymentIntentMatch.reference_id}`
            );
            invoice = paymentIntentMatch;
          } else {
            invoice = invoices[0];
            console.info(
              `REFUND_UPDATE_STEP: Using first match: ${invoice.reference_id}`
            );
          }
        } else {
          invoice = invoices[0];
          console.info(
            `REFUND_UPDATE_STEP: Using first match: ${invoice.reference_id}`
          );
        }
      }
    }

    if (invoiceError) {
      console.error(
        `REFUND_UPDATE_ERROR: Error fetching invoice: ${JSON.stringify(
          invoiceError
        )}`
      );
    }

    if (!invoice) {
      console.error(
        `REFUND_UPDATE_ERROR: No invoice found for charge ${refund.charge}`
      );
      return;
    }

    console.info(
      `REFUND_UPDATE_STEP: Found invoice ${invoice.reference_id} for charge ${refund.charge}`
    );

    const stripe = getStripeInstance();
    console.info(
      `REFUND_UPDATE_STEP: Fetching all refunds for charge ${refund.charge}`
    );
    const allRefunds = await stripe.refunds.list({
      charge: refund.charge as string,
      limit: 100,
    });

    const activeRefundTotal =
      allRefunds.data
        .filter(r => r.status === 'succeeded')
        .reduce((sum, r) => sum + r.amount, 0) / 100;

    console.info(
      `REFUND_UPDATE_STEP: Calculated active refund total for charge ${refund.charge}: $${activeRefundTotal}`
    );
    console.info(
      `REFUND_UPDATE_STEP: Refund statuses: ${JSON.stringify(
        allRefunds.data.map(r => ({ id: r.id, status: r.status }))
      )}`
    );

    console.info(
      `REFUND_UPDATE_STEP: Updating invoice ${
        invoice.reference_id
      } to is_refunded=${
        activeRefundTotal > 0
      }, amount_refunded=${activeRefundTotal}`
    );
    await supabaseAdmin
      .from('invoice')
      .update({
        is_refunded: activeRefundTotal > 0,
        amount_refunded: activeRefundTotal,
        ...(activeRefundTotal === 0 ? { refunded_at: null } : {}),
      })
      .eq('reference_id', invoice.reference_id)
      .throwOnError();

    console.info(
      `REFUND_UPDATE_STEP: Invoice update completed for ${invoice.reference_id}`
    );

    if (
      invoice?.description?.toLowerCase().includes('weight loss') ||
      invoice?.description?.toLowerCase().includes('membership') ||
      (invoice?.description?.toLowerCase().includes('month') &&
        (invoice?.description?.toLowerCase().includes('semaglutide') ||
          invoice?.description?.toLowerCase().includes('tirzepatide')))
    ) {
      console.info(
        `REFUND_UPDATE_STEP: Processing weight loss subscription for invoice ${invoice.reference_id}`
      );

      const { data: subscriptions } = await supabaseAdmin
        .from('patient_subscription')
        .select('reference_id, current_period_end, subscription_id')
        .eq('patient_id', invoice.patient_id)
        .in('status', ['active', 'scheduled_for_cancelation'])
        .order('created_at', { ascending: false })
        .limit(1);

      console.info(
        `REFUND_UPDATE_STEP: Found ${
          subscriptions?.length || 0
        } active subscriptions for patient ${invoice.patient_id}`
      );

      if (subscriptions && subscriptions.length > 0) {
        const subscription = subscriptions[0];
        console.info(
          `REFUND_UPDATE_STEP: Working with subscription ${subscription.reference_id}`
        );

        if (refund.status === 'canceled') {
          console.info(
            `REFUND_UPDATE_STEP: Refund ${refund.id} was canceled. Restoring subscription time`
          );

          try {
            const stripe = getStripeInstance();
            const stripeSubscription = await stripe.subscriptions.retrieve(
              subscription.reference_id
            );

            if (stripeSubscription.metadata?.original_end_date) {
              const originalEndDate = new Date(
                stripeSubscription.metadata.original_end_date
              );
              console.info(
                `REFUND_UPDATE_STEP: Found original subscription end date in metadata: ${originalEndDate.toISOString()}`
              );

              if (activeRefundTotal === 0) {
                console.info(
                  `REFUND_UPDATE_STEP: All refunds canceled. Restoring subscription to original end date.`
                );

                const { data: currentSub } = await supabaseAdmin
                  .from('patient_subscription')
                  .select('current_period_end')
                  .eq('reference_id', subscription.reference_id)
                  .single();

                if (currentSub) {
                  const currentEndDate = new Date(
                    currentSub.current_period_end
                  );
                  console.info(
                    `REFUND_UPDATE_STEP: Will update subscription end date from ${currentEndDate.toISOString()} to original date ${originalEndDate.toISOString()}`
                  );

                  try {
                    await updateSubscriptionEndDate(
                      subscription.reference_id,
                      originalEndDate
                    );
                    console.info(
                      `REFUND_UPDATE_STEP: Successfully restored subscription to original end date ${originalEndDate.toISOString()}`
                    );

                    await stripe.subscriptions.update(
                      subscription.reference_id,
                      {
                        metadata: {
                          original_end_date: '',
                        },
                      }
                    );

                    return;
                  } catch (updateError) {
                    console.error(
                      `REFUND_UPDATE_ERROR: Failed to restore original end date: ${JSON.stringify(
                        updateError
                      )}`
                    );
                  }
                }
              } else {
                console.info(
                  `REFUND_UPDATE_STEP: Some refunds still active ($${activeRefundTotal}). Will calculate partial restoration.`
                );
              }
            } else {
              console.info(
                `REFUND_UPDATE_STEP: No original end date found in metadata. Using standard calculation.`
              );
            }
          } catch (error) {
            console.error(
              `REFUND_UPDATE_ERROR: Error retrieving subscription metadata: ${JSON.stringify(
                error
              )}`
            );
          }

          const months = extractMonthsFromDescription(invoice.description);
          console.info(
            `REFUND_UPDATE_STEP: Extracted ${months} months from invoice description "${invoice.description}"`
          );

          if (months) {
            let extensionMonths = months;
            if (activeRefundTotal > 0 && invoice.amount_due) {
              const { data: previousVersions } = await supabaseAdmin
                .from('invoice')
                .select('amount_refunded, updated_at')
                .eq('reference_id', invoice.reference_id)
                .lt(
                  'updated_at',
                  invoice.updated_at || new Date().toISOString()
                )
                .order('updated_at', { ascending: false })
                .limit(1);

              const prevRefundedAmount =
                previousVersions?.[0]?.amount_refunded || 0;

              const restoredAmount = prevRefundedAmount - activeRefundTotal;

              console.info(
                `REFUND_UPDATE_STEP: Previous refunded amount: $${prevRefundedAmount}, Current refunded amount: $${activeRefundTotal}, Restored amount: $${restoredAmount}`
              );

              let canceledRefundAmount = restoredAmount;
              try {
                if (refund && refund.amount) {
                  canceledRefundAmount = refund.amount / 100;
                  console.info(
                    `REFUND_UPDATE_STEP: Identified specific canceled refund amount: $${canceledRefundAmount}`
                  );
                } else {
                  console.info(
                    `REFUND_UPDATE_STEP: Could not identify specific refund amount, using calculated difference: $${restoredAmount}`
                  );
                }
              } catch (error) {
                console.error(
                  `REFUND_UPDATE_ERROR: Error getting refund amount: ${error}`
                );
              }

              if (canceledRefundAmount > 0) {
                const originalAmount = invoice.amount_due || 0;

                const restorationPercentage =
                  canceledRefundAmount / originalAmount;

                extensionMonths = months * restorationPercentage;

                console.info(
                  `REFUND_UPDATE_STEP: Refund cancelation - restoring $${canceledRefundAmount} (${(
                    restorationPercentage * 100
                  ).toFixed(
                    2
                  )}% of original $${originalAmount}), extending by ${extensionMonths.toFixed(
                    2
                  )} months`
                );

                try {
                  const stripe = getStripeInstance();
                  const stripeSubscription =
                    await stripe.subscriptions.retrieve(
                      subscription.reference_id
                    );

                  if (
                    stripeSubscription.metadata?.invoice_total &&
                    originalAmount ===
                      parseFloat(stripeSubscription.metadata.invoice_total)
                  ) {
                    if (stripeSubscription.metadata?.extension_months) {
                      const totalExtensionMonths = parseFloat(
                        stripeSubscription.metadata.extension_months
                      );

                      const refundPortion =
                        canceledRefundAmount / originalAmount;
                      const exactExtensionMonths =
                        totalExtensionMonths * refundPortion;

                      console.info(
                        `REFUND_UPDATE_STEP: Using precise calculation from metadata: ${
                          refundPortion * 100
                        }% of ${totalExtensionMonths} extension months = ${exactExtensionMonths.toFixed(
                          2
                        )} months`
                      );

                      extensionMonths = exactExtensionMonths;
                    }
                  }
                } catch (error) {
                  console.error(
                    `REFUND_UPDATE_ERROR: Error retrieving subscription metadata: ${error}`
                  );
                }
              } else {
                const remainingPercentage =
                  (invoice.amount_due - activeRefundTotal) / invoice.amount_due;
                extensionMonths = months * remainingPercentage;
                console.info(
                  `REFUND_UPDATE_STEP: Could not determine refund amount. Partial refund remains - extending by ${extensionMonths.toFixed(
                    2
                  )} months (${(remainingPercentage * 100).toFixed(
                    2
                  )}% of original ${months} months)`
                );
              }
            } else {
              console.info(
                `REFUND_UPDATE_STEP: Full refund cancelation - restoring full ${months} month(s) to subscription`
              );
            }

            console.info(
              `REFUND_UPDATE_STEP: Fetching current subscription details for ${subscription.reference_id}`
            );
            const { data: currentSub } = await supabaseAdmin
              .from('patient_subscription')
              .select('current_period_end')
              .eq('reference_id', subscription.reference_id)
              .single();

            if (currentSub) {
              const currentEndDate = new Date(currentSub.current_period_end);

              console.info(
                `REFUND_UPDATE_STEP: Calculating new end date based on current end date ${currentEndDate.toISOString()}`
              );
              const newEndDate = calculateAdjustedDate(
                currentEndDate,
                extensionMonths,
                true
              );

              console.info(
                `REFUND_UPDATE_STEP: Will update subscription end date from ${currentEndDate.toISOString()} to ${newEndDate.toISOString()}`
              );

              console.info(
                `REFUND_UPDATE_STEP: Updating subscription ${subscription.reference_id} end date`
              );
              try {
                await updateSubscriptionEndDate(
                  subscription.reference_id,
                  newEndDate
                );
                console.info(
                  `REFUND_UPDATE_STEP: Successfully updated subscription end date to ${newEndDate.toISOString()}`
                );
              } catch (updateError) {
                console.error(
                  `REFUND_UPDATE_ERROR: Failed to update subscription: ${JSON.stringify(
                    updateError
                  )}`
                );
              }
            } else {
              console.error(
                `REFUND_UPDATE_ERROR: Couldn't find current subscription data for ${subscription.reference_id}`
              );
            }
          } else {
            console.error(
              `REFUND_UPDATE_ERROR: Couldn't extract months from invoice description: "${invoice.description}"`
            );
          }
        } else {
          console.info(
            `REFUND_UPDATE_STEP: Refund status is ${refund.status}, not handling subscription update`
          );
        }
      }
    } else {
      console.info(
        `REFUND_UPDATE_STEP: Invoice description doesn't match weight loss criteria: "${invoice.description}"`
      );
    }

    console.info(
      `REFUND_UPDATE_COMPLETE: Successfully processed refund update for ${refund.id}`
    );
  } catch (err: any) {
    console.error(`REFUND_UPDATE_ERROR: ${err.message}`, err);
    throw new Error(
      `Error in charge/refundUpdate: ${JSON.stringify(
        err?.message || 'There was an unexpected error'
      )}`
    );
  }
};
