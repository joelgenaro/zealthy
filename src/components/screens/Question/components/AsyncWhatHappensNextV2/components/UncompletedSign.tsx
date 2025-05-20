import Timer from '@/components/shared/icons/Timer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

interface UncompletedSignProps {
  hasDivider?: boolean;
}

const UncompletedSign = ({ hasDivider = true }: UncompletedSignProps) => {
  return (
    <Stack
      alignItems="center"
      sx={{
        height: 'inherit',
        width: '40px',
        textAlign: 'center',
        marginRight: '16px',
      }}
    >
      <Box
        sx={{
          width: '40px',
          height: '40px',
          backgroundColor: 'transparent',
          border: '2px dashed #B5BABC',
          borderRadius: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Timer stroke="#B5BABC" />
      </Box>
      {hasDivider ? (
        <Divider
          orientation="vertical"
          textAlign="left"
          sx={{
            height: 'calc(100% - 40px)',
            border: '2px dashed #B5BABC',
          }}
        />
      ) : null}
    </Stack>
  );
};

export default UncompletedSign;
