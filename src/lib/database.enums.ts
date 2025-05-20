export enum AppointmentStatus {
  'REQUESTED' = 'Requested',
  'CONFIRMED' = 'Confirmed',
  'REJECTED' = 'Rejected',
  'NOSHOWED' = 'Noshowed',
  'EXITED' = 'Exited',
  'ROOMED' = 'Roomed',
  'ARRIVED' = 'Arrived',
  'ATTEMPTED' = 'Attempted',
  'UNCONFIRMED' = 'Unconfirmed',
  'PROVIDERREQUESTED' = 'ProviderRequested',
  'CANCELLED' = 'Cancelled',
  'COMPLETED' = 'Completed',
  'CHECKED-IN' = 'Checked-in',
  'UNASSIGNED' = 'Unassigned',
  'PROVIDER-NOSHOWED' = 'Provider-Noshowed',
  'PATIENT-NOSHOWED' = 'Patient-Noshowed',
}

export enum AppointmentType {
  'PROVIDER' = 'Provider',
  'COACH_(MENTAL_HEALTH)' = 'Coach (Mental Health)',
  'COACH_(WEIGHT_LOSS)' = 'Coach (Weight Loss)',
}

export enum ClinicianNoteType {
  'FREETEXT' = 'FREETEXT',
  'TEMPLATE' = 'TEMPLATE',
}

export enum CompoundMedicationReason {
  'CANNOT_LOCATE_ELSEWHERE' = 'CANNOT_LOCATE_ELSEWHERE',
  'POSITIVE_THERAPEUTIC_RESPONSE' = 'POSITIVE_THERAPEUTIC_RESPONSE',
  'STRENGTH_DOSE_CUSTOMIZATION' = 'STRENGTH_DOSE_CUSTOMIZATION',
  'FLEXIBILITY_OF_DOSING' = 'FLEXIBILITY_OF_DOSING',
  'DOSAGE_FORM_ACCEPTANCE' = 'DOSAGE_FORM_ACCEPTANCE',
  'EASE_OF_ADMINISTRATION' = 'EASE_OF_ADMINISTRATION',
  'PRICING' = 'PRICING',
  'TREATMENT_CONTINUATION' = 'TREATMENT_CONTINUATION',
  'OTHER' = 'OTHER',
}

export enum CouponSourceType {
  'INTERNAL' = 'INTERNAL',
  'RADIO' = 'RADIO',
}

export enum CouponUnitType {
  'PERCENT' = 'PERCENT',
  'DOLLAR' = 'DOLLAR',
}

export enum DeviceType {
  'MOBILE' = 'MOBILE',
  'WEB' = 'WEB',
}

export enum EncounterType {
  'SCHEDULED' = 'Scheduled',
  'WALKED-IN' = 'Walked-in',
}

export enum InsurancePolicyType {
  'PRIMARY' = 'Primary',
  'SECONDARY' = 'Secondary',
}

export enum MedicationType {
  'BIRTH_CONTROL' = 'BIRTH_CONTROL',
  'ED' = 'ED',
  'HAIR_LOSS' = 'HAIR_LOSS',
  'HAIR_LOSS_ADD_ON' = 'HAIR_LOSS_ADD_ON',
  'EMERGENCY_BIRTH_CONTROL' = 'EMERGENCY_BIRTH_CONTROL',
  'ACNE' = 'Acne',
  'ANTI-AGING' = 'Anti-Aging',
  'MELASMA' = 'Melasma',
  'ROSACEA' = 'Rosacea',
  'SKINCARE' = 'Skincare',
  'WEIGHT_LOSS' = 'WEIGHT_LOSS',
  'MENTAL_HEALTH' = 'Mental health',
  'ENCLOMIPHENE' = 'Enclomiphene',
  'PREWORKOUT' = 'Preworkout',
  'FEMALE_HAIR_LOSS' = 'Female hair loss',
  'WEIGHT_LOSS_GLP1_(ORAL)' = 'WEIGHT_LOSS_GLP1 (ORAL)',
  'WEIGHT_LOSS_GLP1_(INJECTABLE)' = 'WEIGHT_LOSS_GLP1 (INJECTABLE)',
  'PERSONALIZED_PSYCHIATRY' = 'Personalized Psychiatry',
  'HIV' = 'HIV',
  'SLEEP' = 'Sleep',
  'SEX_+_HAIR' = 'Sex + Hair',
  'MENOPAUSE' = 'Menopause',
}

export enum NotificationsType {
  'CHART_REVIEW' = 'CHART_REVIEW',
  'WEIGHT_LOSS_PROMO' = 'WEIGHT_LOSS_PROMO',
  'MOBILE_DOWNLOAD' = 'MOBILE_DOWNLOAD',
  'RATE_GOOGLE' = 'RATE_GOOGLE',
  'RATE_BBB' = 'RATE_BBB',
  'RATE_TP' = 'RATE_TP',
}

export enum PatientActionType {
  'MISSING_HEIGHT_WEIGHT' = 'MISSING_HEIGHT_WEIGHT',
  'CANCELLED_PRESCRIPTION' = 'CANCELLED_PRESCRIPTION',
  'COMPOUND_MEDICATION_REQUEST' = 'COMPOUND_MEDICATION_REQUEST',
  'PRESCRIPTION_RENEWAL_REQUEST' = 'PRESCRIPTION_RENEWAL_REQUEST',
  'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST' = 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST',
  'RATE_COACH' = 'RATE_COACH',
  'ENCLOMIPHENE_CHECK_IN' = 'ENCLOMIPHENE_CHECK_IN',
  'ENCLOMIPHENE_LAB_RESULT' = 'ENCLOMIPHENE_LAB_RESULT',
  'INSURANCE_INFO_REQUESTED' = 'INSURANCE_INFO_REQUESTED',
  'ADDITIONAL_PA_QUESTIONS' = 'ADDITIONAL_PA_QUESTIONS',
  'REFILL_REQUEST_PS' = 'REFILL_REQUEST_PS',
  'CONTINUE_WEIGHT_LOSS' = 'CONTINUE_WEIGHT_LOSS',
  'FULL_BODY_PHOTO' = 'FULL_BODY_PHOTO',
  'DOWNLOAD_MOBILE_APP' = 'DOWNLOAD_MOBILE_APP',
  'PRESCRIPTION_RENEWAL' = 'PRESCRIPTION_RENEWAL',
}

export enum PriorAuthSubStatus {
  'READY_TO_PRESCRIBE' = 'READY_TO_PRESCRIBE',
  'PATIENT_ACTION_NEEDED' = 'PATIENT_ACTION_NEEDED',
  'PRESCRIBED' = 'PRESCRIBED',
}

export enum ProfileApp {
  'ZPLAN' = 'ZPlan',
  'FITRXAPP' = 'FitRxApp',
  'ZEALTHY' = 'Zealthy',
}

export enum PromoTextKeyType {
  'SPECIFIC_CARE' = 'specific_care',
  'POTENTIAL_INSURANCE' = 'potential_insurance',
  'COMPOUND_BUNDLED' = 'compound_bundled',
  'VARIANT' = 'variant',
}

export enum ProviderStatus {
  'ON' = 'ON',
  'OFF' = 'OFF',
  'EXISTING_PATIENTS' = 'EXISTING_PATIENTS',
  'DEACTIVATED' = 'DEACTIVATED',
  'OUT_OF_OFFICE' = 'OUT_OF_OFFICE',
}

export enum ProviderType {
  'PROVIDER_(MD_OR_DO)' = 'Provider (MD or DO)',
  'PROVIDER_(NP_OR_PA)' = 'Provider (NP or PA)',
  'COACH_(WEIGHT_LOSS)' = 'Coach (Weight Loss)',
  'COACH_(MENTAL_HEALTH)' = 'Coach (Mental Health)',
  'COORDINATOR' = 'Coordinator',
  'PROVIDER_(PMHNP)' = 'Provider (PMHNP)',
  'LEAD_COORDINATOR' = 'Lead Coordinator',
  'COORDINATOR_(ALL)' = 'Coordinator (All)',
  'COORDINATOR_(MESSAGES)' = 'Coordinator (Messages)',
  'COORDINATOR_(PAS)' = 'Coordinator (PAs)',
  'PROVIDER' = 'Provider',
  'LEAD_PROVIDER' = 'Lead Provider',
  'COORDINATOR_(CALLS)' = 'Coordinator (Calls)',
  'COORDINATOR_(EMAILS)' = 'Coordinator (Emails)',
  'SUPERVISOR_(LEAD_COORDINATOR)' = 'Supervisor (Lead Coordinator)',
  'SUPERVISOR_(LEAD_PROVIDER)' = 'Supervisor (Lead Provider)',
  'SUPERVISOR_(LEAD_COACH)' = 'Supervisor (Lead Coach)',
  'LEAD_COACH' = 'Lead Coach',
  'PROVIDER_SUPPORT' = 'Provider Support',
  'PROVIDER_(AMH)' = 'Provider (AMH)',
  'ORDER_SUPPORT' = 'Order Support',
  'PROVIDER_(BUNDLED_TRAINED)' = 'Provider (Bundled Trained)',
  'NURSE_NAVIGATOR' = 'Nurse Navigator',
  'PRESCRIBE_WITHOUT_CHARGING' = 'Prescribe Without Charging',
  'SUBSCRIPTION_REFUND_ISSUER' = 'Subscription Refund Issuer',
  'MEDICATION_REFUND_ISSUER' = 'Medication Refund Issuer',
  'UPLOAD_DOCUMENTS' = 'Upload Documents',
  'QUALITY_ASSURANCE_(COORDINATOR)' = 'Quality Assurance (Coordinator)',
  'QUALITY_ASSURANCE_(PROVIDERS)' = 'Quality Assurance (Providers)',
  'QUALITY_ASSURANCE_(COACHES)' = 'Quality Assurance (Coaches)',
  'RX_ORDERS' = 'Rx Orders',
  'PROVIDER_(ENCLOMIPHENE_TRAINED)' = 'Provider (Enclomiphene Trained)',
  'MANUAL_CHARGE' = 'Manual Charge',
  'PAYMENT_METHODS_UPDATER' = 'Payment Methods Updater',
  'PROVIDER_(FULL_TIME)' = 'Provider (Full Time)',
  'COORDINATOR_(CALL_REQUESTS)' = 'Coordinator (Call Requests)',
  'COORDINATOR_(RETENTION)' = 'Coordinator (Retention)',
  'INCIDENT_REPORTER' = 'Incident Reporter',
  'PROVIDER_(QA)' = 'Provider (QA)',
  'COORDINATOR_(PATIENT_EXPERIENCE)' = 'Coordinator (Patient Experience)',
  'COORDINATOR_(PA-PREP)' = 'Coordinator (PA-Prep)',
  'COORDINATOR_(ENCLOMIPHENE_LABS)' = 'Coordinator (Enclomiphene Labs)',
  'PROVIDER_(PILOT_COMPENSATION_MODEL)' = 'Provider (Pilot Compensation Model)',
  'PROVIDER_(NON-WL)' = 'Provider (Non-WL)',
  'COORDINATOR_(DISPUTE_AND_FRAUD)' = 'Coordinator (Dispute and Fraud)',
}

export enum RoleTypes {
  'ADMIN' = 'ADMIN',
  'CLINICIAN' = 'CLINICIAN',
  'COORDINATOR' = 'COORDINATOR',
  'ACCOUNTING' = 'ACCOUNTING',
  'DEVELOPER' = 'DEVELOPER',
  'TESTER' = 'TESTER',
}

export enum VisitStatus {
  'CREATED' = 'Created',
  'PAID' = 'Paid',
  'COMPLETED' = 'Completed',
  'CANCELED' = 'Canceled',
}

export enum VisitType {
  'VIDEO' = 'Video',
  'PHONE' = 'Phone',
}
