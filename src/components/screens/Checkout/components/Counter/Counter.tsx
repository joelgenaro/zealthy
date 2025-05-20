import Timer from '@/components/shared/icons/Timer';
import CustomText from '@/components/shared/Text/CustomText';
import useCountDown from '@/utils/hooks/useCountdown';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

import { useVisitState } from '@/components/hooks/useVisit';

interface Props {
  time?: number;
  text?: string;
}

const Counter = ({ time, text }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const count = useCountDown(() => console.info('Counter is Done'), time || 10);
  const { selectedCare } = useVisitState();
  const isWeightLoss = selectedCare.careSelections.find(
    s => s.reason === 'Weight loss'
  );

  const renderContent = () => {
    const promoMessage = (
      <Typography
        textAlign="center"
        fontSize={`${isMobile ? '14px' : 'inherit'}`}
        paddingLeft={`${isMobile ? '10px' : '24px'} `}
        paddingRight={`${isMobile ? '10px' : '24px'} `}
        color="primary"
        fontWeight="bold"
      >
        {isWeightLoss
          ? `Your approval expires in ${count}`.toUpperCase()
          : 'Limited Time: Enter the code ZEALTHY20 to get $20 off your first purchase'}
      </Typography>
    );

    if (isWeightLoss) {
      return promoMessage;
    }

    return (
      <>
        <Timer />
        <CustomText>{`${
          text || 'Time left in this step'
        }: ${count}`}</CustomText>
      </>
    );
  };

  return (
    <Box
      bgcolor="#B8F5CC"
      padding="15px 0"
      display="flex"
      gap="16px"
      justifyContent="center"
      alignItems="center"
    >
      {renderContent()}
    </Box>
  );
};

export default Counter;
