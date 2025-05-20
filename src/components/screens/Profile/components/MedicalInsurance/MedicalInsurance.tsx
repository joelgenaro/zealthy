import { usePatientInsurance } from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Router from 'next/router';
import AddIcon from '@mui/icons-material/Add';
import { useInsuranceAsync } from '@/components/hooks/useInsurance';

const MedicalInsurance = () => {
  const { data: patientInsurances, refetch } = usePatientInsurance();
  const { deleteInsurancePolicy } = useInsuranceAsync();

  return (
    <Stack direction="column" gap="16px">
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
        Medical insurance
      </Typography>
      {patientInsurances?.length ? (
        patientInsurances.map((patientInsurance, i) => (
          <Box
            key={'coverage-' + i}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '24px',
              background: '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '16px',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: '600',
                lineHeight: '24px !important',
                color: '#989898',
              }}
            >
              {`${patientInsurance.policy_type} Insurance`}
            </Typography>
            <Typography>{patientInsurance?.payer?.name}</Typography>
            {patientInsurance?.plan_name ? (
              <Typography>{`Plan Name: ${patientInsurance?.plan_name}`}</Typography>
            ) : null}
            <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
              {`Subscriber Number: ${patientInsurance?.member_id}`}
            </Typography>
            <Link
              onClick={() =>
                deleteInsurancePolicy(patientInsurance?.id!).then(() =>
                  refetch()
                )
              }
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {'Remove'}
            </Link>
          </Box>
        ))
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '24px',
            background: '#FFFFFF',
            border: '1px solid #D8D8D8',
            borderRadius: '16px',
          }}
        >
          <Typography sx={{ marginBottom: '16px' }}>
            No primary insurance
          </Typography>
          <Link
            onClick={() =>
              Router.push(
                `${Pathnames.PATIENT_PORTAL_UPDATE_INSURANCE}?type=Primary`
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Add'}
          </Link>
        </Box>
      )}
      {!!patientInsurances?.length && patientInsurances?.length < 2 && (
        <Box
          onClick={() =>
            Router.push(
              `${Pathnames.PATIENT_PORTAL_UPDATE_INSURANCE}?policy_type=${
                patientInsurances[0].policy_type === 'Primary'
                  ? 'Secondary'
                  : 'Primary'
              }`
            )
          }
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            border: '1px solid #D8D8D8',
            borderRadius: '16px',
            cursor: 'pointer',
            gap: '10px',
          }}
        >
          <AddIcon />
          Add a coverage
        </Box>
      )}
    </Stack>
  );
};

export default MedicalInsurance;
