import ArrowRight from '@/components/shared/icons/ArrowRight';
import {
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const data = [
  {
    title: 'How Zealthy’s Weight Loss Program works',
    subtitle: 'Let’s go over what to expect in the following weeks',
    url: 'https://api.getzealthy.com/storage/v1/object/public/pdfs/weight-loss-lessons/How%20the%20Zealthy%20Weight%20Loss%20Program%20works.pdf',
  },
  {
    title: 'How Zealthy helps get GLP-1 medication covered by insurance',
    subtitle: 'Learn about the prior authorization process',
    url: 'https://api.getzealthy.com/storage/v1/object/public/pdfs/weight-loss-lessons/How%20Zealthy%20helps%20get%20GLP-1%20medication%20covered%20by%20insurance.pdf',
  },
  {
    title: 'Who is on your care team',
    subtitle: 'Learn how your care team can best support your journey',
    url: 'https://api.getzealthy.com/storage/v1/object/public/pdfs/weight-loss-lessons/Who%20is%20on%20your%20care%20team.pdf',
  },
  {
    title: 'How to add Zealthy to your home screen',
    subtitle: 'Let’s make your treatment easily accessible to you',
    url: 'https://api.getzealthy.com/storage/v1/object/public/pdfs/weight-loss-lessons/How%20to%20add%20Zealthy%20to%20your%20home%20screen.pdf',
  },
];

const WeightLossLessons = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="sm">
      <Typography variant="h2" sx={{ marginBottom: '3rem' }}>
        {'Lessons'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {data.map(({ title, subtitle, url }) => (
          <Box
            key={title}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 25px',
              alignItems: 'center',
              gap: '5px',
              borderRadius: '1rem',
              padding: '1rem',
              border: '1px solid #D8D8D8',
              background: '#FFF',
              boxShadow: '2px 4px 9px 0px rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
              transition: 'all .2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.01)',
              },
            }}
            onClick={() => window.open(url)}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, marginBottom: '0.5rem' }}
              >
                {title}
              </Typography>
              <Typography variant="body1">{subtitle}</Typography>
            </Box>
            <ArrowRight />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default WeightLossLessons;
