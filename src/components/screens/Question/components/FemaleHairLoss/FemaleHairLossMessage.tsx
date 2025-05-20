import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const FemaleHairLossMessage = () => {
  const highlightedText = {
    backgroundColor: '#B8F5CC',
    color: '#00531B',
    width: 'fit-content',
    padding: '4px',
    borderRadius: '10px',
    fontWeight: 500,
  };

  return (
    <Stack gap={2}>
      <Typography>
        Hair loss is very common for women to experience at some point.
      </Typography>
      <Typography sx={{ lineHeight: '20px' }}>
        We can help you regrow <span style={highlightedText}>thicker,</span>{' '}
        <span style={highlightedText}>fuller</span> hair in as little as 3-6
        months since helping women regrow hair is our{' '}
        <span style={highlightedText}>specialty.</span>
      </Typography>
    </Stack>
  );
};

export default FemaleHairLossMessage;
