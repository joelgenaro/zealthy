export enum Endpoints {
  TREAT_ME_NOW_ESTIMATED_TIME = '/service/treat-me-now/estimated-time',
  REQUEST_TREAT_ME_NOW = '/service/treat-me-now/request-visit',
  TREAT_ME_NOW_AVAILABILITY = '/service/treat-me-now/availability',
  PAYMENT_CREATE_SUBSCRIPTIONS = '/service/payment/create-subscriptions',
  CREATE_SUBSCRIPTION_KLARNA = '/service/payment/create-subscription-klarna',
  PAY_FOR_ORDER = '/service/payment/pay-for-order',
  CREATE_MEDICATION_SUBSCRIPTION = '/service/payment/create-medication-subscription',
  CREATE_STRIPE_CUSTOMER = '/service/payment/create-customer',
  SCHEDULE_FOR_CANCEL_STRIPE_SUBSCRIPTION = '/service/payment/schedule-for-cancelation',
  REACTIVATE_STRIPE_SUBSCRIPTION = '/service/payment/reactivate-subscription',
  RENEW_STRIPE_SUBSCRIPTION = '/service/payment/renew-subscription',
  RENEW_STRIPE_PRESCRIPTION = '/service/payment/renew-prescription',
  REPLACE_STRIPE_SUBSCRIPTION = '/service/payment/replace-subscription',
  CANCEL_STRIPE_SUBSCRIPTION = '/service/payment/cancel-subscription',
  PAYMENT_CHECKOUT = '/service/payment/checkout',
  OUTSTANDING_BALANCE = '/service/payment/outstanding-balance',
  VOID_INVOICES = '/service/payment/void-invoices',
  PAYMENT_ADDON = '/service/payment/addon',
  DEFAULT_PAYMENT_METHOD = '/service/payment/default-payment-method',
  UPDATE_DEFAULT_PAYMENT_METHOD = '/service/payment/update-default-payment-method',
  CREATE_CHARGE_REFUND = '/service/payment/create-charge-refund',
  CREATE_SETUP_INTENT = '/service/payment/create-setup-intent',
  CREATE_PAYMENT_INTENT = '/service/payment/create-payment-intent',
  CREATE_INVOICE_PAYMENT = '/service/payment/create-invoice-payment',
  SUBMIT_ANSWERS = '/service/questions/submit-answers',
  PAYMENT_UPGRADE_SUBSCRIPTIONS = 'service/payment/upgrade-subscription',
  SUBMIT_RESPONSES = '/submit-responses',
  UPDATE_ADDRESS = '/service/address/update',
  GET_COUPON_USAGE = '/service/payment/get-coupon-usage',
  APPLY_COUPON_SUBSCRIPTION = '/service/payment/apply-coupon-subscription',

  // identity verification
  IDENTITY_CROSS_CHECK = '/service/identity/crosscheck',
  IDENTITY_DOB_CHECK = '/service/identity/dob-check',
  IDENTITY_SSN_CHECK = '/service/identity/ssn-check',

  //patient-actions
  UPSERT_PATIENT_ITEM = '/service/patient-action/upsert',
  UPDATE_PATIENT_ITEM = '/service/patient-action/update',

  //daily
  GET_DAILY_TOKEN = '/api/daily/daily-token',

  // Empower
  CREATE_EMPOWER_ORDER = '/empower/create-empower-order',
}
