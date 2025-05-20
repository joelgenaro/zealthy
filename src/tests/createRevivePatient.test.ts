import axios from 'axios';
import { createRevivePatient } from '@/utils/Revive/createRevivePatient';
import { phoneDigitsOnly } from '@/utils/phoneDigitsOnly';
import { Patient } from '../context/AppContext/reducers/types/patient';
import { PatientAddress, Profile } from '../components/hooks/data';

jest.mock('axios');

describe('createRevivePatient', () => {
  const mockPatient = {
    id: '123',
    profiles: {
      birth_date: '1990-01-01',
      gender: 'male',
      last_name: 'Doe',
      first_name: 'John',
      phone_number: '123-456-7890',
      email: 'johndoe@example.com',
    },
    region: 'NV',
  } as unknown as Patient & { profiles: Profile };
  const mockPatientAddress = {
    city: 'Anytown',
    state: 'AnyState',
    address_line_1: '123 Any Street',
    address_line_2: 'Suite 200',
    zip_code: '12345',
  } as unknown as PatientAddress;

  const nodeEnv = process.env.NODE_ENV || 'development';
  const mockEnvVars = {
    REVIVE_BASE_URL: 'https://api.revive.com',
    REVIVE_API_KEY: 'secretKey',
    REVIVE_CLINIC_IDENTIFIER: 'clinic123',
    REVIVE_PRACTITIONER_IDENTIFIER: 'practitioner123',
    NODE_ENV: nodeEnv,
  };
  const mockResponse = {
    data: {
      patient_id: 456,
      success: true,
    },
  };

  beforeEach(() => {
    process.env = { ...mockEnvVars };
    (axios as unknown as jest.Mock).mockResolvedValue(mockResponse);
  });

  it('should successfully create a revive patient and return the patient_id', async () => {
    const patientId = await createRevivePatient(
      mockPatient,
      mockPatientAddress
    );
    expect(patientId).toBe(456);
    expect(axios).toHaveBeenCalledWith({
      method: 'POST',
      url: `${process.env.REVIVE_BASE_URL}/api/v5/provider_portal/patient/create_new`,
      headers: {
        'x-pmk-authentication-token': process.env.REVIVE_API_KEY,
      },
      data: {
        active: true,
        address: [
          {
            city: mockPatientAddress.city,
            country: 'US',
            line: [
              mockPatientAddress.address_line_1,
              mockPatientAddress.address_line_2,
            ],
            postalCode: mockPatientAddress.zip_code,
            state: mockPatientAddress.state,
            data: {},
          },
        ],
        birthDate: mockPatient.profiles.birth_date,
        gender: mockPatient.profiles.gender,
        name: [
          {
            family: mockPatient.profiles.last_name,
            given: [mockPatient.profiles.first_name],
            use: 'official',
          },
        ],
        resourceType: 'Patient',
        telecom: [
          {
            system: 'phone',
            value: phoneDigitsOnly(mockPatient.profiles.phone_number!),
            use: 'primary',
          },
          {
            system: 'email',
            value: mockPatient.profiles.email,
          },
        ],
        clinic_identifier: process.env.REVIVE_CLINIC_IDENTIFIER,
        practitioner_identifier: process.env.REVIVE_PRACTITIONER_IDENTIFIER,
      },
    });
  });

  it('should throw an error if patient creation fails', async () => {
    const failResponse = { data: { success: false } };
    (axios as unknown as jest.Mock).mockResolvedValueOnce(failResponse);
    await expect(
      createRevivePatient(mockPatient, mockPatientAddress)
    ).rejects.toThrow(`Unable to create Revive patient for ${mockPatient.id}`);
  });
});
