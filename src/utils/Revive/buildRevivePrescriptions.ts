import { Database } from '@/lib/database.types';
import { uuid } from 'uuidv4';

type Prescription = Database['public']['Tables']['prescription']['Row'];

type BuildRevivePrescriptionsParams = {
  prescriptions: Prescription[];
};

type PrescriptionBuilderType = {
  prescription: Prescription;
};

export interface RevivePrescriptionItem {
  authorization_for_emergency_dispensing: boolean;
  authorization_for_emergency_dispensing_date_written: null;
  control_level: 0;
  date_issued: string;
  days_supply: number | null;
  do_not_fill: false;
  do_not_refill: false;
  dose: '5 mg/0.5 ml' | '10 mg/0.5 ml' | '2.5 mg/ml' | '1 mg/ml' | '5 mg/ml';
  is_reauthorization: false;
  medication: string;
  medication_data: {};
  medication_order_entry_identifier: string;
  patient_contact_requested: false;
  product_identification: {
    product_identifier: string | null;
  };
  quantity_authorized: number;
  reason_for_compounding: {
    code: '';
    description: 'Ease of administration';
  };
  sig: string | null;
  unit_of_measure: 'C28254';
  refills_authorized: 0;
}

const extractDoseFromMedName = (medication: string) => {
  const match = medication.match(/(\d+(?:\.\d+)?)/);

  if (match) {
    const dosage = parseFloat(match[0]);
    return dosage;
  } else {
    throw new Error('unable to extract dose');
  }
};

const tirzepatideDoseMap = {
  20: '5 mg/0.5 ml',
  40: '10 mg/0.5 ml',
  60: '10 mg/0.5 ml',
} as const;

const semaglutideDoseMap = {
  '2.5': '2.5 mg/ml',
  5: '2.5 mg/ml',
  7: '1 mg/ml',
  '7.5': '2.5 mg/ml',
  10: '5 mg/ml',
  20: '5 mg/ml',
} as const;

const displayNameAddendumMap = {
  '1 mg/ml': '(Starting Dose)',
  '2.5 mg/ml': '(Starting or Continuation Dose)',
  '5 mg/ml': '(Continuation Dose)',
};

const getQuantity = (
  totalDosage: number,
  mappedDosage:
    | (typeof semaglutideDoseMap)[keyof typeof semaglutideDoseMap]
    | (typeof tirzepatideDoseMap)[keyof typeof tirzepatideDoseMap],
  isTirzepatide: boolean
) => {
  const denominator = extractDoseFromMedName(mappedDosage);
  const quantity = totalDosage / denominator;
  return isTirzepatide ? quantity / 2 : quantity;
};

const getDoseQuantityAndDisplayName = (
  medicationName: string,
  medicationId: string
) => {
  const isTirzepatide = medicationName.toLowerCase().includes('tirzepatide');
  const dosageInMg = extractDoseFromMedName(medicationName);
  const mappedDose = isTirzepatide
    ? tirzepatideDoseMap[dosageInMg as keyof typeof tirzepatideDoseMap]
    : semaglutideDoseMap[dosageInMg as keyof typeof semaglutideDoseMap];

  const quantity = getQuantity(dosageInMg, mappedDose, isTirzepatide);
  const tirzepatideDisplayNameMapping = {
    '9169322e-ef2a-40db-bbdb-c2c3052c8cf1': `Tirzepatide 5 mg/0.5 ml / Pyridoxine HCL 1mg/0.5ml Sterile Solution for Injection - 1 mL`, // 10 mg vial NOT USED
    '36c4605b-069d-40e4-8d1e-c76881dde9d4': `Tirzepatide 5 mg/0.5 ml / Pyridoxine HCL 1mg/0.5ml Sterile Solution for Injection - 2 mL`, // 20 mg vial
    '56166ef6-10b1-4039-8dbc-16dcd7fc5e99': `Tirzepatide 10 mg/0.5 ml / Pyridoxine HCl 1 mg/0.5 ml Sterile Solution for Injection - 2 mL`, // 40 mg vial
    'bc178994-47c1-403a-aa30-3e33a0d9f840': `Tirzepatide 10 mg/0.5 ml / Pyridoxine HCl 1 mg/0.5 ml Sterile Solution for Injection - 3 mL`, // 60 mg vial
  };

  const semaglutideDisplayNameMapping = {
    '93534247-a7cc-40ba-ae56-7a81a9a966c7': `Semaglutide 1 mg/ml / Pyridoxine HCl 2 mg/ml Sterile Solution for Injection - 7 ml`, // 7 mg vial NOT USED
    '563f8dfe-5a0f-4087-9c7c-8e83fa1ef811': `Semaglutide 2.5 mg/ml / Pyridoxine HCl 2 mg/ml Sterile Solution for Injection - 1 ml`, // 2.5 mg vial
    '932e883d-74e8-4037-a739-a8ab85db243b': `Semaglutide 2.5 mg/ml / Pyridoxine HCl 2 mg/ml Sterile Solution for Injection - 2 ml`, // 5 mg vial
    'c03df36b-1a4b-40ca-b423-660244a004bd': `Semaglutide 2.5 mg/ml / Pyridoxine HCl 2 mg/ml Sterile Solution for Injection - 3 ml`, // 7.5 mg vial
    '11abb4a2-f855-404f-b502-19e4e4eb5da9': `Semaglutide 2.5 mg/ml / Pyridoxine HCl 2 mg/ml Sterile Solution for Injection - 4 ml`, // 10 mg vial NOT USED
    '11eaf925-22ab-4034-b39d-3e8f51d0f8a5': `Semaglutide 5 mg/ml / Pyridoxine HCl 2 mg/ml Sterile Solution for Injection - 2 ml`, // 10 mg vial
  };

  console.log(
    medicationId,
    tirzepatideDisplayNameMapping[
      medicationId as keyof typeof tirzepatideDisplayNameMapping
    ],
    'VARUN'
  );
  console.log(
    medicationId,
    semaglutideDisplayNameMapping[
      medicationId as keyof typeof semaglutideDisplayNameMapping
    ],
    'JAMES'
  );

  if (isTirzepatide && medicationId in tirzepatideDisplayNameMapping) {
    return {
      mappedDose,
      displayName:
        tirzepatideDisplayNameMapping[
          medicationId as keyof typeof tirzepatideDisplayNameMapping
        ],
      quantity,
    };
  } else if (medicationId in semaglutideDisplayNameMapping) {
    return {
      mappedDose,
      displayName:
        semaglutideDisplayNameMapping[
          medicationId as keyof typeof semaglutideDisplayNameMapping
        ],
      quantity,
    };
  } else {
    return {
      mappedDose,
      displayName: `Semaglutide Sterile Solution for Injection ${mappedDose} Vial ${
        displayNameAddendumMap[
          mappedDose as keyof typeof displayNameAddendumMap
        ]
      } ${quantity} ml`,
      quantity,
    };
  }
};

const buildPrescription = ({
  prescription,
}: PrescriptionBuilderType): RevivePrescriptionItem => {
  const { mappedDose, quantity, displayName } = getDoseQuantityAndDisplayName(
    prescription?.medication || '',
    prescription.medication_id || ''
  );
  return {
    authorization_for_emergency_dispensing: false,
    authorization_for_emergency_dispensing_date_written: null,
    control_level: 0,
    date_issued: new Date().toISOString(),
    days_supply: prescription?.duration_in_days ?? null,
    do_not_fill: false,
    do_not_refill: false,
    dose: mappedDose,
    is_reauthorization: false,
    medication: displayName,
    medication_data: {},
    medication_order_entry_identifier: uuid(),
    patient_contact_requested: false,
    product_identification: {
      product_identifier: prescription?.medication_id,
    },
    quantity_authorized: quantity,
    reason_for_compounding: {
      code: '',
      description: 'Ease of administration',
    },
    sig: prescription?.dosage_instructions,
    unit_of_measure: 'C28254',
    refills_authorized: 0,
  };
};

export const buildRevivePrescriptions = ({
  prescriptions,
}: BuildRevivePrescriptionsParams) => {
  return prescriptions.map(p =>
    buildPrescription({
      prescription: p!,
    })
  );
};
