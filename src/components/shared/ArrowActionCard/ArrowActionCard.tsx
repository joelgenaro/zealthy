import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowRight from '../icons/ArrowRight';
import Loading from '../Loading/Loading';

interface ArrowActionCardProps {
  header?: string;
  text: string;
  subText?: string;
  onClick: () => void;
  loading?: boolean;
}

const ArrowActionCard = ({
  header,
  text,
  subText,
  onClick,
  loading,
}: ArrowActionCardProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 24px',
        gap: '24px',
        alignItems: 'center',
        background: '#FFFFFF',
        border: '0.5px solid #CCCCCC',
        borderRadius: '16px',
        padding: '24px',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <Box>
        <Typography
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            lineHeight: '25px',
            marginBottom: '8px',
          }}
        >
          {header}
        </Typography>
        <Typography
          component="p"
          variant="body1"
          sx={{
            fontWeight: '00',
            lineHeight: '24px',
            lineSpacing: '0.3px',
            color: '#1B1B1B',
          }}
        >
          {text}
        </Typography>
        <Typography
          component="h3"
          variant="h3"
          sx={{
            color: '#989898',
            fontWeight: '500',
            fontSize: '14px !important',
          }}
        >
          {subText}
        </Typography>
      </Box>
      {loading ? (
        <Loading fontSize="20px !important" />
      ) : (
        <ArrowRight style={{ display: 'flex', justifySelf: 'flex-end' }} />
      )}
    </Box>
  );
};

export default ArrowActionCard;
