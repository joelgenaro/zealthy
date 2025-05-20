import Timer from '@/components/shared/icons/Timer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

interface UncompletedSignProps {
  hasDivider?: boolean;
  inProgress?: boolean;
  Icon: () => JSX.Element;
}

const UncompletedSign = ({
  hasDivider = true,
  inProgress = false,
  Icon,
}: UncompletedSignProps) => {
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
            zIndex: 1,
            backgroundColor: inProgress ? '#005315' : '#fff',
            border: inProgress ? 'none' : '2px dashed #B5BABC',
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

export default UncompletedSign;
