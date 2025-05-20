import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';

const ProviderRecommendationCard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      borderRadius="12px"
      padding="24px"
      gap="16px"
      bgcolor="#EEEEEE"
      boxShadow="0px 12px 24px 4px rgba(0, 0, 0, 0.04)"
    >
      <Typography variant="caption" component="p" sx={{ fontStyle: 'italic' }}>
        {children}
      </Typography>
    </Box>
  );
};

export default ProviderRecommendationCard;
