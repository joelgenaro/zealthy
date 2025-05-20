import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Circle from '../Circle';
import CheckMark from '../icons/CheckMark';

interface IconCardProps {
  Icon: () => JSX.Element;
  title: string;
  subTitle: string;
  isConfirmed?: boolean;
}

const IconCard = ({
  Icon,
  title,
  subTitle,
  isConfirmed = false,
}: IconCardProps) => {
  return (
    <Box display="flex" gap="16px" alignItems="center">
      <Circle size="72px">
        <Icon />
      </Circle>
      <Box>
        <Typography color="#1B1B1B" variant="h6" fontWeight="600">
          {title}
        </Typography>
        <Typography
          color="#777777"
          fontSize="16px"
          marginBottom="24px"
          variant="caption"
        >
          {subTitle}
        </Typography>
      </Box>
      {isConfirmed ? <CheckMark style={{ marginLeft: 'auto' }} /> : null}
    </Box>
  );
};

export default IconCard;
