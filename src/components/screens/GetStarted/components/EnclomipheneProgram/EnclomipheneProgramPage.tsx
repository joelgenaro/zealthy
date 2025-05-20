import CircleCheck from '@/components/shared/icons/CircleCheck';
import { Pathnames } from '@/types/pathnames';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';

const EnclomipheneProgramPage = () => {
  const { push, query } = useRouter();

  const benefits = [
    { text: 'Increased lean mass' },
    { text: 'More energy' },
    { text: 'Increased confidence' },
    { text: 'More Motivation' },
  ];

  const accessItems = [
    { text: 'Prescription medication (if eligible)' },
    { text: 'Licensed doctor consults' },
    { text: 'Unlimited messaging & support from care team' },
    { text: 'Free 2 day priority shipping for medication' },
  ];

  return (
    <Container>
      <Stack gap="2rem" justifyContent={'flex-start'}>
        <Typography variant="h2" fontWeight={900}>
          Zealthy Enclomiphene: Double your testosterone
        </Typography>
        <Typography variant="body1">
          Zealthy uses an easy to use prescription tablet that is used to
          naturally raise testosterone production. It’s highly effective and
          doesn’t include any painful injections or side effects that are
          associated with testosterone treatments
        </Typography>
        <Stack gap="2rem">
          <Stack gap="1.5rem">
            <Typography fontWeight={600}>Benefits:</Typography>
            <Box sx={{ gap: '2rem' }}>
              {benefits.map((benefit, i) => (
                <Box key={i} sx={{ display: 'flex', gap: '0.5rem' }}>
                  <Box>
                    <CircleCheck />
                  </Box>
                  <Typography fontSize="16px" sx={{ marginTop: '12px' }}>
                    {benefit.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Stack>
          <Stack gap="1.5rem">
            <Typography fontWeight={600}>
              As low as $99/month to have access to:
            </Typography>
            <Box sx={{ gap: '2rem' }}>
              {accessItems.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: '0.5rem' }}>
                  <Box>
                    <CircleCheck />
                  </Box>
                  <Typography fontSize="16px" sx={{ marginTop: '12px' }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Stack>
        </Stack>
        <br></br>
        <Button
          type="button"
          sx={{
            height: '56px',
            minWidth: '200px',
            width: '90%',
            borderRadius: 'rounded',
            color: '#FFF',
            fontStyle: 'normal',
            lineHeight: '16px', // or '133.333%',
            letterSpacing: '0.048px',
          }}
          onClick={() =>
            push({
              pathname: Pathnames.SIGN_UP,
              query: query,
            })
          }
        >
          {'Continue'}
        </Button>
      </Stack>
    </Container>
  );
};

export default EnclomipheneProgramPage;
