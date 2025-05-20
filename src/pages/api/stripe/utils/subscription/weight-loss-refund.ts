import { supabaseAdmin } from '@/lib/supabaseAdmin';
// import Stripe from 'stripe';
import getStripeInstance from '../../createClient';
import { Database } from '@/lib/database.types';

type Subscription = Database['public']['Tables']['patient_subscription']['Row'];
type SubscriptionSubset = Pick<
  Subscription,
  | 'subscription_id'
  | 'reference_id'
  | 'current_period_end'
  | 'status'
  | 'created_at'
>;

type Invoice = Database['public']['Tables']['invoice']['Row'];

/**
 * Extract the number of months from an invoice description
 */
export const extractMonthsFromDescription = (
  description: string | null
): number | null => {
  if (!description) return null;

  const monthsMatch = description.match(/(\d+)[-\s]+[Mm]onth/i);
  if (!monthsMatch || !monthsMatch[1]) return null;

  return parseInt(monthsMatch[1], 10);
};

/**
 * Calculate a new date by adjusting months and days
 */
export const calculateAdjustedDate = (
  baseDate: Date,
  monthsAdjustment: number,
  isAddition = false
): Date => {
  const newDate = new Date(baseDate);

  const fullMonths = Math.floor(Math.abs(monthsAdjustment));
  if (isAddition) {
    newDate.setMonth(newDate.getMonth() + fullMonths);
  } else {
    newDate.setMonth(newDate.getMonth() - fullMonths);
  }

  const remainingDays = Math.round(
    (Math.abs(monthsAdjustment) - fullMonths) * 30
  );
  if (remainingDays > 0) {
    if (isAddition) {
      newDate.setDate(newDate.getDate() + remainingDays);
    } else {
      newDate.setDate(newDate.getDate() - remainingDays);
    }
  }

  return newDate;
};

export const findBaseSubscription = async (
  invoice: Invoice
): Promise<{
  foundBase: boolean;
  minEndDate: Date;
}> => {
  const { data: baseSubscriptionInvoices } = await supabaseAdmin
    .from('invoice')
    .select('*')
    .eq('patient_id', invoice.patient_id)
    .eq('status', 'paid')
    .eq('is_refunded', false)
    .neq('reference_id', invoice.reference_id)
    .in('billing_reason', [
      'subscription_create',
      'subscription_update',
      'manual',
    ])
    .order('created_at', { ascending: false })
    .limit(5);

  let minEndDate = new Date();
  let foundBase = false;

  if (baseSubscriptionInvoices && baseSubscriptionInvoices.length > 0) {
    const subscriptionEvent = baseSubscriptionInvoices.find(
      inv =>
        (inv.billing_reason === 'subscription_create' ||
          inv.billing_reason === 'subscription_update') &&
        inv.description?.toLowerCase().includes('weight loss')
    );

    // If no subscription event, look for manual payment for base subscription
    const manualSubscription =
      subscriptionEvent ||
      baseSubscriptionInvoices.find(
        inv =>
          inv.billing_reason === 'manual' &&
          inv.description?.toLowerCase().includes('month') &&
          inv.description?.toLowerCase().includes('weight loss') &&
          !inv.description?.toLowerCase().includes('do not charge')
      );

    if (manualSubscription) {
      // Base subscriptions are typically 1 month unless specified otherwise
      const baseCreatedAt = new Date(manualSubscription.created_at);
      foundBase = true;

      // Extract the month count from description if available
      let baseMonths = 1;
      const months = extractMonthsFromDescription(
        manualSubscription.description
      );
      if (months) {
        baseMonths = months;
      }

      minEndDate = new Date(baseCreatedAt);
      minEndDate.setMonth(minEndDate.getMonth() + baseMonths);

      console.info(
        `Found base subscription from ${
          manualSubscription.billing_reason
        } invoice created on ${baseCreatedAt.toISOString()}, for ${baseMonths} month(s), minimum end date: ${minEndDate.toISOString()}`
      );
    }
  }

  return { foundBase, minEndDate };
};

/**
 * Update subscription end date in both Supabase and Stripe
 */
export const updateSubscriptionEndDate = async (
  subscriptionId: string,
  newEndDate: Date,
  isRefund: boolean = false,
  invoice?: Invoice
): Promise<void> => {
  const stripeTimestamp = Math.floor(newEndDate.getTime() / 1000);
  const stripe = getStripeInstance();

  try {
    // Before updating, get the current subscription to save metadata if needed
    if (isRefund && invoice) {
      try {
        const currentSubscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        const currentEndDate = new Date(
          (currentSubscription.trial_end ||
            currentSubscription.current_period_end) * 1000
        );

        // Parse current metadata
        const metadata = currentSubscription.metadata || {};

        // Store the original end date if this is the first refund
        if (!metadata.original_end_date) {
          metadata.original_end_date = currentEndDate.toISOString();
          console.info(
            `Saving original subscription end date ${currentEndDate.toISOString()} before applying refund`
          );
        }

        // Store base subscription information
        if (!metadata.base_end_date && invoice) {
          // Find base subscription end date
          const { foundBase, minEndDate } = await findBaseSubscription(invoice);
          if (foundBase) {
            metadata.base_end_date = minEndDate.toISOString();
            console.info(
              `Saving base subscription end date ${minEndDate.toISOString()} in metadata`
            );

            // Also store information about how many months in the subscription are "extension" months
            const baseCreatedAt = new Date(minEndDate);
            baseCreatedAt.setMonth(baseCreatedAt.getMonth() - 1); // Go back 1 month to get start date

            const originalEndDate = metadata.original_end_date
              ? new Date(metadata.original_end_date)
              : currentEndDate;

            // Calculate total months in subscription (from base start to original end)
            const totalMonthsDiff =
              (originalEndDate.getTime() - baseCreatedAt.getTime()) /
              (1000 * 60 * 60 * 24 * 30);

            // Calculate extension months (total months minus base month)
            const extensionMonths = Math.max(0, totalMonthsDiff - 1);
            metadata.extension_months = extensionMonths.toString();

            console.info(
              `Subscription has ${extensionMonths.toFixed(
                2
              )} extension months beyond the base month`
            );
          }
        }

        // Store current refund information
        if (invoice?.amount_refunded && invoice?.amount_due) {
          const refundPercentage = invoice.amount_refunded / invoice.amount_due;
          metadata.last_refund_amount = invoice.amount_refunded.toString();
          metadata.last_refund_percentage = refundPercentage.toString();
          metadata.invoice_total = invoice.amount_due.toString();

          console.info(
            `Saving refund information: ${invoice.amount_refunded} of ${
              invoice.amount_due
            } (${(refundPercentage * 100).toFixed(2)}%)`
          );
        }

        // Update the metadata in Stripe
        await stripe.subscriptions.update(subscriptionId, {
          metadata: metadata,
        });
      } catch (error) {
        console.error(`Error saving metadata: ${error}`);
      }
    }

    // Update Supabase
    await supabaseAdmin
      .from('patient_subscription')
      .update({
        current_period_end: newEndDate.toISOString(),
      })
      .eq('reference_id', subscriptionId)
      .throwOnError();

    // Update Stripe
    await stripe.subscriptions.update(subscriptionId, {
      trial_end: stripeTimestamp,
      proration_behavior: 'none',
    });

    console.info(
      `Successfully updated Stripe subscription ${subscriptionId} end date to ${newEndDate.toISOString()} (Stripe timestamp: ${stripeTimestamp})`
    );
  } catch (error) {
    console.error(`Error updating subscription end date: ${error}`);
    throw error;
  }
};

export const handleWeightLossRefund = async (invoice: Invoice) => {
  // The invoice description checks have been moved to the refunded.ts file
  // This function now assumes it only receives weight loss related invoices

  const months = extractMonthsFromDescription(invoice.description);
  if (!months) return;

  const totalMonths = months;
  const monthsToDeduct = invoice.description?.includes('Subscription upgrade')
    ? totalMonths - 1
    : totalMonths;

  // Special handling for full refunds of subscription upgrades
  if (
    invoice.amount_refunded &&
    invoice.amount_due &&
    invoice.amount_refunded >= invoice.amount_due &&
    (invoice.description?.toLowerCase().includes('upgrade') ||
      invoice.description?.toLowerCase().includes('switch to'))
  ) {
    const restored = await restorePreviousSubscriptionAfterUpgradeRefund(
      invoice
    );
    if (restored) {
      console.info(
        `Subscription upgrade was fully refunded - restored previous subscription`
      );
      return; // Don't proceed with the normal refund logic if we restored the previous subscription
    }
  }

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const { data: previousRefunds, error: refundsError } = await supabaseAdmin
    .from('invoice')
    .select('*')
    .eq('patient_id', invoice.patient_id)
    .eq('is_refunded', true)
    .neq('reference_id', invoice.reference_id)
    .gte('refunded_at', oneMonthAgo.toISOString())
    .order('refunded_at', { ascending: false });

  if (refundsError) {
    console.error('Error fetching previous refunds:', refundsError);
  } else if (previousRefunds && invoice.amount_refunded) {
    const duplicateRefund = previousRefunds.find(
      prevRefund => prevRefund.amount_refunded === invoice.amount_refunded
    );

    if (duplicateRefund) {
      console.info(
        `Duplicate refund detected for patient ${invoice.patient_id}. Found previous refund with same amount (${invoice.amount_refunded}) processed on ${duplicateRefund.refunded_at}. Skipping subscription date update.`
      );
      return;
    }
  }
  const { data: subscriptions } = await supabaseAdmin
    .from('patient_subscription')
    .select(
      'subscription_id, reference_id, current_period_end, status, created_at'
    )
    .eq('patient_id', invoice.patient_id)
    .in('subscription_id', [4, 13, 14, 18, 19, 26, 34, 35, 52, 53, 54])
    .in('status', ['active', 'scheduled_for_cancelation'])
    .order('created_at', { ascending: false });

  if (!subscriptions || subscriptions.length === 0) return;

  if (subscriptions.length > 1) {
    const activeSubscriptions = subscriptions.filter(
      sub => sub.status === 'active'
    );
    const scheduledForCancelationSubscriptions = subscriptions.filter(
      sub => sub.status === 'scheduled_for_cancelation'
    );

    if (
      activeSubscriptions.length === 1 &&
      scheduledForCancelationSubscriptions.length > 0
    ) {
      const activeSubscription = activeSubscriptions[0];
      const activeCreatedAt = new Date(
        activeSubscription.created_at || new Date()
      );

      const allOldEnough = scheduledForCancelationSubscriptions.every(sub => {
        const subCreatedAt = new Date(sub.created_at || new Date());
        const diffInMonths =
          (activeCreatedAt.getTime() - subCreatedAt.getTime()) /
          (1000 * 60 * 60 * 24 * 30);
        return diffInMonths >= 3;
      });

      if (!allOldEnough) {
        console.info(
          `Multiple subscriptions found for patient ${invoice.patient_id} with at least one scheduled_for_cancelation subscription less than 3 months older than the active one. Skipping subscription date update.`
        );
        return;
      }
    } else {
      console.info(
        `Multiple subscriptions found for patient ${invoice.patient_id}. Skipping subscription date update.`
      );
      return;
    }
  }

  const subscription: SubscriptionSubset = subscriptions[0];
  console.info(
    `Adjusting subscription end date for Weight Loss Membership refund. Patient ID: ${invoice.patient_id}, Subscription ID: ${subscription.subscription_id}, Reference ID: ${subscription.reference_id}`
  );

  let refundPercentage = 1.0;
  if (
    invoice.amount_due &&
    invoice.amount_refunded &&
    invoice.amount_refunded < invoice.amount_due
  ) {
    // Reset this approach - get refund data directly from Stripe for accuracy
    let prevRefundedAmount = 0;
    let currentRefundId = '';
    let currentRefundAmount = 0;

    // Get refund data directly from Stripe
    try {
      if (invoice.charge) {
        console.info(
          `Fetching refund data directly from Stripe for charge ${invoice.charge}`
        );
        const stripe = getStripeInstance();
        const charge = await stripe.charges.retrieve(invoice.charge, {
          expand: ['refunds'],
        });

        if (
          charge.refunds &&
          charge.refunds.data &&
          charge.refunds.data.length > 0
        ) {
          // Only consider successful refunds
          const successfulRefunds = charge.refunds.data.filter(
            r => r.status === 'succeeded'
          );

          console.info(
            `Found ${successfulRefunds.length} successful refunds for charge ${invoice.charge}`
          );

          if (successfulRefunds.length > 0) {
            // Sort refunds by created date, newest first
            const sortedRefunds = [...successfulRefunds].sort(
              (a, b) => b.created - a.created
            );

            // The current refund is the most recent one
            const currentRefund = sortedRefunds[0];
            currentRefundId = currentRefund.id;
            currentRefundAmount = currentRefund.amount / 100; // Convert from cents

            // If this is from a specific webhook event, the refund amount might be more accurate
            // from the invoice.amount_refunded if multiple refunds processed at once
            if (successfulRefunds.length === 1 && invoice.amount_refunded) {
              currentRefundAmount = invoice.amount_refunded;
            }

            console.info(
              `Current refund: ${currentRefundId} for $${currentRefundAmount}`
            );

            // Calculate the total previous refund amount (excluding the current one)
            // by taking older refunds
            if (successfulRefunds.length > 1) {
              // Previous refunds are all successful refunds except the current one
              prevRefundedAmount = sortedRefunds
                .slice(1) // Skip the most recent (current) refund
                .reduce((sum, refund) => sum + refund.amount / 100, 0);

              console.info(
                `Previous successful refunds total: $${prevRefundedAmount}`
              );
            }

            // Double-check against total amount_refunded in the invoice
            // If our calculation doesn't match the invoice, prefer the invoice data
            if (
              invoice.amount_refunded &&
              Math.abs(
                prevRefundedAmount +
                  currentRefundAmount -
                  invoice.amount_refunded
              ) > 1
            ) {
              console.info(
                `Refund amount mismatch: Calculated total ($${
                  prevRefundedAmount + currentRefundAmount
                }) ` +
                  `doesn't match invoice.amount_refunded ($${invoice.amount_refunded})`
              );

              // Try to correct the current refund amount
              if (
                prevRefundedAmount > 0 &&
                invoice.amount_refunded > prevRefundedAmount
              ) {
                currentRefundAmount =
                  invoice.amount_refunded - prevRefundedAmount;
                console.info(
                  `Adjusted current refund amount to $${currentRefundAmount} based on invoice data`
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching refund data from Stripe:', error);
    }

    // Calculate refund percentage based on what we found
    if (prevRefundedAmount > 0) {
      // This is a subsequent refund, calculate based on remaining amount
      const remainingAmountBeforeThisRefund =
        invoice.amount_due - prevRefundedAmount;
      refundPercentage = currentRefundAmount / remainingAmountBeforeThisRefund;

      console.info(
        `Multiple refunds detected: Previous refunded amount: $${prevRefundedAmount}, ` +
          `Current refund amount: $${currentRefundAmount}, Total now refunded: $${invoice.amount_refunded}`
      );
      console.info(
        `Remaining amount before this refund: $${remainingAmountBeforeThisRefund}, ` +
          `This refund is ${(refundPercentage * 100).toFixed(
            2
          )}% of remaining amount`
      );
    } else {
      // First refund or couldn't detect previous refunds
      refundPercentage = invoice.amount_refunded / invoice.amount_due;
      console.info(
        `First refund or couldn't detect previous refunds. Refunding $${
          invoice.amount_refunded
        } of $${invoice.amount_due} (${(refundPercentage * 100).toFixed(2)}%)`
      );
    }

    console.info(
      `Partial refund detected: Using ${(refundPercentage * 100).toFixed(
        2
      )}% for time reduction calculation`
    );
  }

  // Find the base subscription period early so we can check it before calculating deduction
  const { foundBase, minEndDate } = await findBaseSubscription(invoice);

  // Get current end date
  const currentEndDate = new Date(
    subscription.current_period_end || new Date()
  );

  // Try to get additional information from Stripe metadata to handle multiple partial refunds
  let baseEndDate = foundBase ? new Date(minEndDate) : null;
  let extensionMonths = 0;
  let baseMonthAlreadyRefunded = false;
  let originalEndDate = null;

  try {
    const stripe = getStripeInstance();
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.reference_id
    );

    if (stripeSubscription.metadata) {
      // If we have stored the base_end_date in metadata, prefer that over the calculated one
      if (stripeSubscription.metadata.base_end_date) {
        baseEndDate = new Date(stripeSubscription.metadata.base_end_date);
        console.info(
          `Using base end date from metadata: ${baseEndDate.toISOString()}`
        );
      }

      // Get original end date from metadata
      if (stripeSubscription.metadata.original_end_date) {
        originalEndDate = new Date(
          stripeSubscription.metadata.original_end_date
        );
        console.info(
          `Found original end date from metadata: ${originalEndDate.toISOString()}`
        );
      }

      // Get extension months from metadata if available
      if (stripeSubscription.metadata.extension_months) {
        extensionMonths = parseFloat(
          stripeSubscription.metadata.extension_months
        );
        console.info(`Found ${extensionMonths} extension months in metadata`);
      }

      // Check if the base month has already been refunded
      if (stripeSubscription.metadata.base_month_refunded === 'true') {
        baseMonthAlreadyRefunded = true;
        console.info(
          `Base month has already been refunded according to metadata`
        );
      }
    }
  } catch (error) {
    console.error(`Error retrieving subscription metadata: ${error}`);
  }

  // Use the original date to calculate time properly for subsequent refunds
  let totalDaysInSubscription = monthsToDeduct * 30; // Default
  let daysLeftInSubscription = totalDaysInSubscription;

  if (originalEndDate && baseEndDate) {
    // Calculate the actual total days in the subscription from base to original end date
    const totalTimeInMs = originalEndDate.getTime() - baseEndDate.getTime();
    totalDaysInSubscription = totalTimeInMs / (1000 * 60 * 60 * 24);

    // Calculate the days left in subscription (from current to base)
    const timeLeftInMs = currentEndDate.getTime() - baseEndDate.getTime();
    daysLeftInSubscription = Math.max(0, timeLeftInMs / (1000 * 60 * 60 * 24));

    console.info(
      `Total subscription days (from metadata): ${totalDaysInSubscription.toFixed(
        1
      )}`
    );
    console.info(
      `Days left in subscription: ${daysLeftInSubscription.toFixed(1)}`
    );
  }

  // Special handling for upgrade subscriptions
  let isUpgradeSubscription = false;
  let upgradeFromEndDate = null;

  try {
    const stripe = getStripeInstance();
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.reference_id
    );

    // Check if this is an upgrade subscription
    if (
      stripeSubscription.metadata?.is_upgrade === 'true' &&
      stripeSubscription.metadata?.upgrade_from_end_date
    ) {
      isUpgradeSubscription = true;
      upgradeFromEndDate = new Date(
        stripeSubscription.metadata.upgrade_from_end_date
      );
      console.info(
        `Detected upgrade subscription with previous end date: ${upgradeFromEndDate.toISOString()}`
      );
    }
  } catch (error) {
    console.error(`Error checking upgrade status: ${error}`);
  }

  if (isUpgradeSubscription && upgradeFromEndDate && originalEndDate) {
    // For upgrades, calculate based on time between previous subscription end date
    // and the original end date of the upgraded subscription
    const totalTimeInMs =
      originalEndDate.getTime() - upgradeFromEndDate.getTime();
    totalDaysInSubscription = Math.max(
      0,
      totalTimeInMs / (1000 * 60 * 60 * 24)
    );

    // Days left is from current end date back to the previous subscription end date
    const timeLeftInMs =
      currentEndDate.getTime() - upgradeFromEndDate.getTime();
    daysLeftInSubscription = Math.max(0, timeLeftInMs / (1000 * 60 * 60 * 24));

    console.info(
      `UPGRADE SUBSCRIPTION: Total days between previous end date and original end date: ${totalDaysInSubscription.toFixed(
        1
      )}`
    );
    console.info(
      `UPGRADE SUBSCRIPTION: Days left between current end date and previous end date: ${daysLeftInSubscription.toFixed(
        1
      )}`
    );
  } else if (originalEndDate && baseEndDate) {
    // Standard calculation for non-upgrade subscriptions
    const totalTimeInMs = originalEndDate.getTime() - baseEndDate.getTime();
    totalDaysInSubscription = totalTimeInMs / (1000 * 60 * 60 * 24);

    const timeLeftInMs = currentEndDate.getTime() - baseEndDate.getTime();
    daysLeftInSubscription = Math.max(0, timeLeftInMs / (1000 * 60 * 60 * 24));

    console.info(
      `Total subscription days (from metadata): ${totalDaysInSubscription.toFixed(
        1
      )}`
    );
    console.info(
      `Days left in subscription: ${daysLeftInSubscription.toFixed(1)}`
    );
  }

  // For multiple partial refunds, adjust the refund percentage calculation
  // For the second+ refund, we need to base the deduction on the REMAINING time, not the total
  let effectiveRefundPercentage = refundPercentage;

  // If there's metadata about previous refunds and this isn't the first refund
  if (
    originalEndDate &&
    baseEndDate &&
    daysLeftInSubscription < totalDaysInSubscription
  ) {
    // Calculate what percentage of the ORIGINAL time we should reduce
    effectiveRefundPercentage =
      refundPercentage * (daysLeftInSubscription / totalDaysInSubscription);

    console.info(
      `Multiple partial refunds - adjusting calculation: Refund is ${(
        refundPercentage * 100
      ).toFixed(2)}% of remaining amount, ` +
        `which is ${(effectiveRefundPercentage * 100).toFixed(
          2
        )}% of the original subscription time`
    );
  }

  // Calculate how many days we should deduct based on adjusted refund percentage
  const daysToDeduct = totalDaysInSubscription * effectiveRefundPercentage;

  console.info(
    `Refund calculation: Total days in subscription: ${totalDaysInSubscription.toFixed(
      1
    )}, ` +
      `Days to deduct: ${daysToDeduct.toFixed(1)} (${(
        effectiveRefundPercentage * 100
      ).toFixed(2)}% effective)`
  );

  // Calculate effective months to deduct
  const effectiveMonthsToDeduct = daysToDeduct / 30;

  console.info(
    `Final calculation: Will deduct ${effectiveMonthsToDeduct.toFixed(
      2
    )} months ` + `from current end date ${currentEndDate.toISOString()}`
  );

  // Calculate new end date using the utility function
  let newEndDate = calculateAdjustedDate(
    currentEndDate,
    effectiveMonthsToDeduct,
    false
  );

  console.info(
    `Date calculation: ${currentEndDate.toISOString()} minus ${Math.floor(
      effectiveMonthsToDeduct
    )} months and ${Math.round(
      (effectiveMonthsToDeduct - Math.floor(effectiveMonthsToDeduct)) * 30
    )} days = ${newEndDate.toISOString()}`
  );

  // Apply the base subscription minimum with special handling for upgrades
  if (foundBase && newEndDate < minEndDate) {
    try {
      // Check if this is a subscription upgrade by examining metadata
      const stripe = getStripeInstance();
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.reference_id
      );

      if (
        stripeSubscription.metadata?.is_upgrade === 'true' &&
        stripeSubscription.metadata?.upgrade_from_end_date
      ) {
        // For upgrades, use the previous subscription's end date as the minimum
        const upgradeFromEndDate = new Date(
          stripeSubscription.metadata.upgrade_from_end_date
        );

        // Only use upgrade_from_end_date if it's earlier than the calculated base date
        if (upgradeFromEndDate < minEndDate) {
          console.info(
            `This is an upgrade refund. Using previous subscription end date (${upgradeFromEndDate.toISOString()}) instead of base subscription end date (${minEndDate.toISOString()}).`
          );

          // If the calculated end date is before the previous subscription's end date,
          // use the previous subscription's end date
          if (newEndDate < upgradeFromEndDate) {
            newEndDate = upgradeFromEndDate;
          }
          // Otherwise keep the calculated date, as it's a valid reduction
        } else {
          console.info(
            `Adjusted end date (${newEndDate.toISOString()}) would be before base subscription end date (${minEndDate.toISOString()}). Using base subscription end date.`
          );
          newEndDate = new Date(minEndDate);
        }
      } else {
        // Regular subscription (not an upgrade)
        console.info(
          `Adjusted end date (${newEndDate.toISOString()}) would be before base subscription end date (${minEndDate.toISOString()}). Using base subscription end date.`
        );
        newEndDate = new Date(minEndDate);
      }
    } catch (error) {
      console.error(`Error checking for upgrade metadata: ${error}`);
      // Fallback to original behavior
      console.info(
        `Adjusted end date (${newEndDate.toISOString()}) would be before base subscription end date (${minEndDate.toISOString()}). Using base subscription end date.`
      );
      newEndDate = new Date(minEndDate);
    }
  }

  const now = new Date();
  if (newEndDate < now) {
    console.info(
      `New end date would be in the past (${newEndDate.toISOString()}). Setting to current time + 5 minutes instead.`
    );
    newEndDate.setTime(now.getTime() + 5 * 60 * 1000);
  }

  await updateSubscriptionEndDate(
    subscription.reference_id,
    newEndDate,
    true,
    invoice
  );

  if (baseEndDate && newEndDate <= baseEndDate && !baseMonthAlreadyRefunded) {
    let isBaseMonthInvoice = false;

    try {
      if (baseEndDate) {
        const baseStartDate = new Date(baseEndDate);
        baseStartDate.setMonth(baseStartDate.getMonth() - 1);

        const invoiceCreatedAt = new Date(invoice.created_at || new Date());
        const daysBetween = Math.abs(
          (baseStartDate.getTime() - invoiceCreatedAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysBetween <= 7) {
          isBaseMonthInvoice = true;
          console.info(
            `Invoice appears to be related to base subscription (created within 7 days of base start)`
          );
        }
      }

      if (!isBaseMonthInvoice && invoice.description) {
        if (invoice.description.match(/(\d+)[-\s]+[Mm]onth/i)) {
          const matches = invoice.description.match(/(\d+)[-\s]+[Mm]onth/i);
          if (matches && parseInt(matches[1], 10) > 1) {
            isBaseMonthInvoice = false;
            console.info(
              `Invoice is for multiple months (${matches[1]}), not treating as base month invoice`
            );
          }
        }
      }

      if (isBaseMonthInvoice) {
        const stripe = getStripeInstance();
        await stripe.subscriptions.update(subscription.reference_id, {
          metadata: {
            base_month_refunded: 'true',
          },
        });
        console.info(
          `Updated metadata to indicate base month has been refunded`
        );
      } else {
        console.info(
          `New end date (${newEndDate.toISOString()}) is at or before base date (${baseEndDate.toISOString()}), but this invoice is not for the base month. Not marking base_month_refunded.`
        );

        if (baseMonthAlreadyRefunded) {
          const stripe = getStripeInstance();
          await stripe.subscriptions.update(subscription.reference_id, {
            metadata: {
              base_month_refunded: 'false',
            },
          });
          console.info(
            `Corrected metadata - base month is not actually refunded`
          );
        }
      }
    } catch (error) {
      console.error(`Error updating base_month_refunded metadata: ${error}`);
    }
  }
};

/**
 * Restore a previous subscription when a subscription upgrade invoice is fully refunded
 */
export const restorePreviousSubscriptionAfterUpgradeRefund = async (
  invoice: Invoice
): Promise<boolean> => {
  console.info(
    `Checking if we should restore a previous subscription for full refund of ${invoice.reference_id}`
  );

  try {
    const { data: currentSubs } = await supabaseAdmin
      .from('patient_subscription')
      .select('reference_id')
      .eq('patient_id', invoice.patient_id)
      .in('status', ['active', 'scheduled_for_cancelation'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (!currentSubs || currentSubs.length === 0) {
      console.info(
        `No active subscription found for patient ${invoice.patient_id}`
      );
      return false;
    }

    const activeSubId = currentSubs[0].reference_id;
    console.info(`Found active subscription: ${activeSubId}`);

    const stripe = getStripeInstance();
    const currentSubDetails = await stripe.subscriptions.retrieve(activeSubId);

    if (
      !currentSubDetails.metadata?.is_upgrade ||
      !currentSubDetails.metadata?.upgrade_from_stripe_id
    ) {
      console.info(
        `Current subscription is not from an upgrade or missing previous subscription info`
      );
      return false;
    }

    const previousSubStripeId =
      currentSubDetails.metadata.upgrade_from_stripe_id;
    const previousSubId = currentSubDetails.metadata.upgrade_from_sub_id;
    const previousEndDate = currentSubDetails.metadata.upgrade_from_end_date;

    console.info(
      `Found previous subscription info: ${previousSubStripeId}, ID: ${previousSubId}`
    );

    const { data: previousSubData } = await supabaseAdmin
      .from('patient_subscription')
      .select('*')
      .eq('reference_id', previousSubStripeId)
      .single();

    if (!previousSubData) {
      console.error(
        `Could not find previous subscription record in database: ${previousSubStripeId}`
      );
      return false;
    }

    try {
      await stripe.subscriptions.cancel(activeSubId, {
        invoice_now: false,
        prorate: false,
      });
      console.info(`Canceled current subscription: ${activeSubId}`);

      await supabaseAdmin
        .from('patient_subscription')
        .update({
          status: 'canceled',
          cancel_at: new Date().toISOString(),
          visible: false,
          cancel_reason: 'Upgrade subscription invoice was fully refunded',
        })
        .eq('reference_id', activeSubId);

      const customer_id = await supabaseAdmin
        .from('payment_profile')
        .select('customer_id')
        .eq('patient_id', invoice.patient_id)
        .single()
        .then(({ data }) => data && data.customer_id);

      if (!customer_id) {
        console.error(
          `Could not find customer_id for patient ${invoice.patient_id}`
        );
        return false;
      }

      const { data: subscriptionType } = await supabaseAdmin
        .from('subscription')
        .select('reference_id')
        .eq('id', parseInt(previousSubId, 10))
        .single();

      if (!subscriptionType?.reference_id) {
        console.error(
          `Could not find price ID for subscription type ${previousSubId}`
        );
        return false;
      }

      const newSubscription = await stripe.subscriptions.create({
        customer: customer_id,
        items: [{ price: subscriptionType.reference_id }],
        trial_end: Math.floor(new Date(previousEndDate).getTime() / 1000),
        metadata: {
          zealthy_subscription_id: previousSubId,
          resource: 'subscription',
          zealthy_patient_id: invoice.patient_id.toString(),
          restored_after_refund: 'true',
          restored_from_subscription: activeSubId,
        },
      });

      const existingPrescription = await supabaseAdmin
        .from('prescription')
        .select('*')
        .eq('subscription_id', activeSubId)
        .maybeSingle();
      if (existingPrescription.data?.subscription_id) {
        await supabaseAdmin
          .from('prescription')
          .update({ subscription_id: newSubscription?.id })
          .eq('id', existingPrescription.data.id);
      }

      console.info(
        `Created new subscription with previous details: ${newSubscription.id}, ending on ${previousEndDate}`
      );

      await supabaseAdmin
        .from('patient_subscription')
        .update({
          status: 'active',
          visible: true,
          reference_id: newSubscription.id,
          current_period_end: previousEndDate,
          cancel_reason: null,
        })
        .eq('reference_id', previousSubStripeId);

      console.info(`Updated database record for previous subscription`);

      return true;
    } catch (error) {
      console.error(`Error restoring previous subscription: ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking/restoring previous subscription: ${error}`);
    return false;
  }
};
