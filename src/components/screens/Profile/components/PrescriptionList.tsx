import {
  PatientSubscriptionProps,
  usePatientMedicalSubscriptions,
} from '@/components/hooks/data';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PatientPrescriptions from './PatientPrescriptions';
import { PatientPrescriptionsType } from './PatientPrescriptions/PatientPrescriptions';
import { useRouter } from 'next/router';

export const PrescriptionList = () => {
  // Retrieve only subscriptions with id 5
  const { data: prescriptions } = usePatientMedicalSubscriptions();
  const router = useRouter();

  const getType = (
    sub: PatientSubscriptionProps
  ): PatientPrescriptionsType | null => {
    if (sub.subscription_id !== 5) return null;

    if (sub.care === 'ED') return 'Zealthy ED';

    switch (sub.care) {
      case SpecificCareOption.ENCLOMIPHENE:
        return 'Zealthy Enclomiphene';
      case SpecificCareOption.ACNE:
      case SpecificCareOption.ANTI_AGING:
      case SpecificCareOption.ROSACEA:
      case SpecificCareOption.SKINCARE:
        return 'Zealthy Skin Care';
      case SpecificCareOption.BIRTH_CONTROL:
        return 'Zealthy Birth Control';
      case SpecificCareOption.ANXIETY_OR_DEPRESSION:
      case SpecificCareOption.ASYNC_MENTAL_HEALTH:
        return 'Zealthy Mental Health';
      case SpecificCareOption.ERECTILE_DYSFUNCTION:
        return 'Zealthy ED';
      case SpecificCareOption.SLEEP:
        return 'Zealthy Sleep';
      case SpecificCareOption.MENOPAUSE:
        return 'Zealthy Menopause';
      case SpecificCareOption.SEX_PLUS_HAIR:
        return 'Zealthy Sex + Hair';
      case SpecificCareOption.PREP:
        return 'Zealthy Prep';
      case SpecificCareOption.PRE_WORKOUT:
        return 'Zealthy Pre Workout';
      case SpecificCareOption.HAIR_LOSS:
      case SpecificCareOption.FEMALE_HAIR_LOSS:
        return 'Zealthy Hair Treatment';
      default:
        return null;
    }
  };

  if (!prescriptions) return null;

  const filteredPrescriptions = prescriptions
    .map(prescription => ({
      prescription,
      type: getType(prescription),
    }))
    .filter(item => item.type !== null);

  if (filteredPrescriptions.length === 0) return null;

  return (
    <Stack gap={1}>
      {!router.asPath.includes('/order-history') ? (
        <Typography
          variant="h3"
          sx={{
            fontSize: '18px !important',
            fontWeight: '600',
            lineHeight: '26px !important',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          Prescriptions
        </Typography>
      ) : (
        <Typography
          component="h5"
          variant="body1"
          sx={{ marginBottom: '16px', fontWeight: '600' }}
        >
          Subscriptions
        </Typography>
      )}

      {filteredPrescriptions.map(({ prescription, type }) => (
        <PatientPrescriptions
          key={prescription.subscription_id}
          prescription={prescription}
          type={type!}
        />
      ))}
    </Stack>
  );
};

export default PrescriptionList;
