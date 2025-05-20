import { Box } from '@mui/material';

const BaseCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      width="100%"
      display="flex"
      bgcolor="white"
      alignItems="center"
      borderRadius="24px"
      flexDirection="column"
      boxShadow="0px 12px 24px 4px rgba(0, 0, 0, 0.04);"
    >
      {children}
    </Box>
  );
};

export default BaseCard;
