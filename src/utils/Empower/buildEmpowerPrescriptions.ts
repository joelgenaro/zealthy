import { Database } from '@/lib/database.types';
import { notEmpty } from '@/types/utils/notEmpty';
import uniqWith from 'lodash/uniqWith';
import { isInjectable } from '@/utils/isInjectable';

type Prescription = Database['public']['Tables']['prescription']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type PatientAddress = Database['public']['Tables']['address']['Row'];

type BuildEmpowerPrescriptionsParams = {
  prescriptions: Prescription[];
  patientProfile: Profile;
  patientAddress: PatientAddress;
  patientRegion: string;
};

type PrescriptionMap = {
  [key: string]: {
    quantity: number;
    firstIndex: number;
  };
};

type PrescriptionBuilderType = {
  idx: number;
  quantity: number;
  patientProfile: Profile;
  patientAddress: PatientAddress;
  prescription: Prescription;
  patientRegion: string;
};

export const pharmacyNotes = (prescription: Prescription) => {
  if (prescription.medication?.toLowerCase().includes('tirzepatide')) {
    return 'The patient requires compounded Tirzepatide + Niacinamide to facilitate a dose that cannot be achieved with the commercially available pre-dosed pen.';
  }

  return null;
};

export const buildSig = (
  directions: string,
  quantity: number,
  currentIndex: number
) => {
  const monthsSupply = [1, 2, 3]
    .slice(currentIndex, currentIndex + quantity)
    .join(' and ');
  return `Month ${monthsSupply}: ${directions?.replace(
    /\(.*?\)\s*/g,
    ''
  )} or as directed by your provider`;
};

export const buildSupplies = ({
  total,
  patientProfile,
  patientAddress,
  patientRegion,
}: {
  total: number;
  patientProfile: PrescriptionBuilderType['patientProfile'];
  patientAddress: PrescriptionBuilderType['patientAddress'];
  patientRegion: string;
}) => {
  return [
    {
      Patient: {
        ClientPatientId: null,
        LastName: patientProfile.last_name,
        FirstName: patientProfile.first_name,
        Gender: patientProfile.gender?.[0]?.toUpperCase(),
        DateOfBirth: patientProfile.birth_date,
        Address: {
          AddressLine1: patientAddress?.address_line_1,
          AddressLine2: (patientAddress?.address_line_2 || ',').slice(0, 40),
          City: patientAddress?.city,
          StateProvince: patientAddress?.state,
          PostalCode: patientAddress?.zip_code,
          CountryCode: 'US',
        },
        PhoneNumber: patientProfile.phone_number?.slice(1),
      },
      Prescriber: {
        NPI: process.env.VERCEL_ENV === 'production' ? 1841216629 : 1689995771,
        stateLicenseNumber:
          process.env.VERCEL_ENV === 'production' ? 1841216629 : 1689995771,
        LastName: 'Patel',
        FirstName: 'Risheet',
        Address: {
          AddressLine1: '429 Lenox Ave',
          AddressLine2: null,
          City: 'Miami Beach',
          StateProvince: 'FL',
          PostalCode: '33139',
          CountryCode: 'US',
        },
        PhoneNumber: '9549038072',
      },
      Medication: {
        ItemDesignatorId: 'CDFC44A758FE9EE5932D317B9EA7101C',
        DrugDescription: "SYRINGE 31G  5/16' 1CC (EASY TOUCH)",
        EssentialCopy: 'CDFC44A758FE9EE5932D317B9EA7101C',
        Quantity: total * 10,
        Refills: 0,
        DaysSupply: 30,
        WrittenDate: new Date(),
        SigText: 'USE AS DIRECTED',
        Note: null,
        Diagnosis: {
          ClinicalInformationQualifier: 0,
          Primary: {
            Code: 'Sample',
            Qualifier: 0,
            Description: 'Sample description.',
            DateOfLastOfficeVisit: {
              Date: null,
              DateTime: new Date(),
            },
          },
        },
      },
    },
    {
      Patient: {
        ClientPatientId: null,
        LastName: patientProfile.last_name,
        FirstName: patientProfile.first_name,
        Gender: patientProfile.gender?.[0]?.toUpperCase(),
        DateOfBirth: patientProfile.birth_date,
        Address: {
          AddressLine1: patientAddress?.address_line_1,
          AddressLine2: (patientAddress?.address_line_2 || ',').slice(0, 40),
          City: patientAddress?.city,
          StateProvince: patientAddress?.state,
          PostalCode: patientAddress?.zip_code,
          CountryCode: 'US',
        },
        PhoneNumber: patientProfile.phone_number?.slice(1),
      },
      Prescriber: {
        NPI: process.env.VERCEL_ENV === 'production' ? 1841216629 : 1689995771,
        stateLicenseNumber:
          process.env.VERCEL_ENV === 'production' ? 1841216629 : 1689995771,
        LastName: 'Patel',
        FirstName: 'Risheet',
        Address: {
          AddressLine1: '429 Lenox Ave',
          AddressLine2: null,
          City: 'Miami Beach',
          StateProvince: 'FL',
          PostalCode: '33139',
          CountryCode: 'US',
        },
        PhoneNumber: '9549038072',
      },
      Medication: {
        ItemDesignatorId: '164E03AAC77A9C31601F4F93A294D65F',
        DrugDescription: 'ALCOHOL PREP PADS (EASY TOUCH) (100 PACK) ',
        EssentialCopy: '164E03AAC77A9C31601F4F93A294D65F',
        Quantity: 10,
        Refills: 0,
        DaysSupply: 30,
        WrittenDate: new Date(),
        SigText: 'FOR PREPARATION OF THE SKIN AND EQUIPMENT PRIOR TO INJECTION',
        Note: null,
        Diagnosis: {
          ClinicalInformationQualifier: 0,
          Primary: {
            Code: 'Sample',
            Qualifier: 0,
            Description: 'Sample description.',
            DateOfLastOfficeVisit: {
              Date: null,
              DateTime: new Date(),
            },
          },
        },
      },
    },
  ];
};

const buildPrescription = ({
  idx,
  quantity,
  patientProfile,
  patientAddress,
  prescription,
  patientRegion,
}: PrescriptionBuilderType) => {
  if (
    prescription.medication?.toLowerCase().includes('naltrexone') ||
    prescription.medication?.toLowerCase().includes('bupropion')
  ) {
    return [
      {
        Patient: {
          ClientPatientId: null,
          LastName: patientProfile.last_name,
          FirstName: patientProfile.first_name,
          Gender: patientProfile.gender?.[0]?.toUpperCase(),
          DateOfBirth: patientProfile.birth_date,
          Address: {
            AddressLine1: patientAddress?.address_line_1,
            AddressLine2: patientAddress?.address_line_2 || ',',
            City: patientAddress?.city,
            StateProvince: patientAddress?.state,
            PostalCode: patientAddress?.zip_code,
            CountryCode: 'US',
          },
          PhoneNumber: patientProfile.phone_number?.slice(1),
        },
        Prescriber: {
          NPI:
            process.env.VERCEL_ENV === 'production'
              ? process.env.EMPOWER_DOCTOR_NPI || 1841216629
              : 1689995771,
          stateLicenseNumber:
            process.env.VERCEL_ENV === 'production'
              ? process.env.EMPOWER_DOCTOR_NPI || 1841216629
              : 1689995771,
          LastName: 'Patel',
          FirstName: 'Risheet',
          Address: {
            AddressLine1: '429 Lenox Ave',
            AddressLine2: null,
            City: 'Miami Beach',
            StateProvince: 'FL',
            PostalCode: '33139',
            CountryCode: 'US',
          },
          PhoneNumber: '9549038072',
        },
        Medication: {
          ItemDesignatorId: prescription.medication_id,
          DrugDescription: prescription.medication,
          EssentialCopy: prescription.medication_id,
          Quantity: 30,
          Refills: 0,
          DaysSupply: 30,
          WrittenDate: new Date(),
          SigText: 'Take 1 capsule per day',
          Diagnosis: {
            ClinicalInformationQualifier: 0,
            Primary: {
              Code: 'Sample',
              Qualifier: 0,
              Description: 'Sample description.',
              DateOfLastOfficeVisit: {
                Date: null,
                DateTime: new Date(),
              },
            },
          },
        },
      },
      {
        Patient: {
          ClientPatientId: null,
          LastName: patientProfile.last_name,
          FirstName: patientProfile.first_name,
          Gender: patientProfile.gender?.[0]?.toUpperCase(),
          DateOfBirth: patientProfile.birth_date,
          Address: {
            AddressLine1: patientAddress?.address_line_1,
            AddressLine2: patientAddress?.address_line_2 || ',',
            City: patientAddress?.city,
            StateProvince: patientAddress?.state,
            PostalCode: patientAddress?.zip_code,
            CountryCode: 'US',
          },
          PhoneNumber: patientProfile.phone_number?.slice(1),
        },
        Prescriber: {
          NPI:
            process.env.VERCEL_ENV === 'production'
              ? process.env.EMPOWER_DOCTOR_NPI || 1841216629
              : 1689995771,
          stateLicenseNumber:
            process.env.VERCEL_ENV === 'production'
              ? process.env.EMPOWER_DOCTOR_NPI || 1841216629
              : 1689995771,
          LastName: 'Patel',
          FirstName: 'Risheet',
          Address: {
            AddressLine1: '429 Lenox Ave',
            AddressLine2: null,
            City: 'Miami Beach',
            StateProvince: 'FL',
            PostalCode: '33139',
            CountryCode: 'US',
          },
          PhoneNumber: '9549038072',
        },
        Medication: {
          ItemDesignatorId: '05BA2DEF0011FA179C8BADC95776FC55',
          DrugDescription: 'Bupropion HCL Slow Release',
          EssentialCopy: '05BA2DEF0011FA179C8BADC95776FC55',
          Quantity: 30,
          Refills: 0,
          DaysSupply: 30,
          WrittenDate: new Date(),
          SigText: 'Take 1 capsule per day',
          Diagnosis: {
            ClinicalInformationQualifier: 0,
            Primary: {
              Code: 'Sample',
              Qualifier: 0,
              Description: 'Sample description.',
              DateOfLastOfficeVisit: {
                Date: null,
                DateTime: new Date(),
              },
            },
          },
        },
      },
    ];
  }
  return {
    Patient: {
      ClientPatientId: null,
      LastName: patientProfile.last_name,
      FirstName: patientProfile.first_name,
      Gender: patientProfile.gender?.[0]?.toUpperCase(),
      DateOfBirth: patientProfile.birth_date,
      Address: {
        AddressLine1: patientAddress?.address_line_1,
        AddressLine2: (patientAddress?.address_line_2 || ',').slice(0, 40),
        City: patientAddress?.city,
        StateProvince: patientAddress?.state,
        PostalCode: patientAddress?.zip_code,
        CountryCode: 'US',
      },
      PhoneNumber: patientProfile.phone_number?.slice(1),
    },
    Prescriber: {
      NPI: process.env.VERCEL_ENV === 'production' ? 1841216629 : 1689995771,
      stateLicenseNumber:
        process.env.VERCEL_ENV === 'production' ? 1841216629 : 1689995771,
      LastName: 'Patel',
      FirstName: 'Risheet',
      Address: {
        AddressLine1: '429 Lenox Ave',
        AddressLine2: null,
        City: 'Miami Beach',
        StateProvince: 'FL',
        PostalCode: '33139',
        CountryCode: 'US',
      },
      PhoneNumber: '9549038072',
    },
    Medication: {
      ItemDesignatorId: prescription.medication_id,
      DrugDescription: prescription.medication?.split(' ')[0],
      EssentialCopy: prescription.medication_id,
      Quantity: quantity,
      Refills: 0,
      DaysSupply: 30,
      WrittenDate: new Date(),
      SigText: buildSig(prescription.dosage_instructions || '', quantity, idx),
      Note: pharmacyNotes(prescription),
      Diagnosis: {
        ClinicalInformationQualifier: 0,
        Primary: {
          Code: 'Sample',
          Qualifier: 0,
          Description: 'Sample description.',
          DateOfLastOfficeVisit: {
            Date: null,
            DateTime: new Date(),
          },
        },
      },
    },
  };
};

export const buildEmpowerPrescriptions = ({
  prescriptions,
  patientProfile,
  patientAddress,
  patientRegion,
}: BuildEmpowerPrescriptionsParams) => {
  const prescriptionMap = prescriptions
    .map(p => ({
      medication_id: p.medication_id!,
      sig: p.dosage_instructions!,
    }))
    .reduce((acc, p, idx) => {
      const key = `${p.medication_id} - ${p.sig}`;

      if (!acc[key]) {
        acc[key] = {
          quantity: 1,
          firstIndex: idx,
        };
      } else {
        acc[key].quantity += 1;
      }

      return acc;
    }, {} as PrescriptionMap);

  const empowerPrescriptions = uniqWith(
    prescriptions,
    (p1, p2) =>
      p1.medication_id === p2.medication_id &&
      p1.dosage_instructions === p2.dosage_instructions
  )
    .filter(notEmpty)
    .map(p => {
      const { firstIndex, quantity } =
        prescriptionMap[`${p.medication_id} - ${p.dosage_instructions}`];

      return buildPrescription({
        idx: firstIndex,
        quantity,
        patientProfile: patientProfile,
        patientAddress: patientAddress,
        prescription: p!,
        patientRegion,
      });
    })
    .flat();

  const hasInjectable = prescriptions.some(p => isInjectable(p));
  if (hasInjectable) {
    return empowerPrescriptions.concat(
      buildSupplies({
        total: prescriptions.length,
        patientAddress,
        patientProfile,
        patientRegion,
      })
    );
  }

  return empowerPrescriptions;
};
