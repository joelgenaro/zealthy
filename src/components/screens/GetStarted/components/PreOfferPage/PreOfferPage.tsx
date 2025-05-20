import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const listItems = [
  'Answer some questions about your mental health',
  'Connect with a provider 100% online, no appointment needed',
  'Get customized mental health treatment, including medication delivered to your door if prescribed',
];

interface PreOfferPageProps {
  onClick: () => void;
}

const PreOfferPage = ({ onClick }: PreOfferPageProps) => {
  return (
    <Stack gap="48px">
      <Stack gap="16px">
        <Typography variant="h2">Welcome to Zealthy.</Typography>
        <Typography>
          Today, you’ll answer some questions about how you’ve been feeling so
          that we can get you started on the right treatment plan.
        </Typography>
        <Typography>We can ship medication directly to your home. </Typography>
      </Stack>
      <Button onClick={onClick}>Continue</Button>
    </Stack>
  );
};

export default PreOfferPage;
