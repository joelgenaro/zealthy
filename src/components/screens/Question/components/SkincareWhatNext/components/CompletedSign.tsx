import CheckMark from '@/components/shared/icons/CheckMark';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

interface CompletedSignProps {
  Icon: () => JSX.Element;
}

const CompletedSign = ({ Icon }: CompletedSignProps) => {
  return (
    <Stack direction="row">
      <Stack
        alignItems="center"
        sx={{
          height: 'inherit',
          width: '40px',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: '40px',
            height: '40px',
            backgroundColor: '#005315',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckMark stroke="#ffffff" />
        </Box>
        <Divider
          orientation="vertical"
          textAlign="left"
          sx={{
            height: 'calc(100% - 40px)',
            border: '2px solid #005315',
          }}
        />
      </Stack>
      <Box
        sx={{
          marginLeft: '-10px',
          zIndex: -1,
        }}
      >
        <Icon />
      </Box>
    </Stack>
  );
};

export default CompletedSign;
