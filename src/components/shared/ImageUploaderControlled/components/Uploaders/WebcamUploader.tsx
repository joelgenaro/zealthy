import { Stack, Typography } from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import DottedBox from './DottedBox';
import Circle from '@/components/shared/Circle';

interface WebcamUploaderProps {
  title: string | null;
  subtitle: string | null;
  subImageText: string | null;
  onClick: () => void;
}

const WebcamUploader = ({
  title,
  subtitle,
  subImageText,
  onClick,
}: WebcamUploaderProps) => {
  return (
    <Stack gap="16px" direction="column">
      <Stack>
        {title ? <Typography variant="h2">{title}</Typography> : null}
        {subtitle ? <Typography>{subtitle}</Typography> : null}
      </Stack>
      <DottedBox onClick={onClick}>
        <Stack direction="column" alignItems="center">
          <Circle size="72px">
            <CameraAltOutlinedIcon fontSize="large" />
          </Circle>
          {subImageText ? (
            <Typography
              variant="body2"
              component="p"
              sx={{ marginTop: '16px', textAlign: 'center' }}
            >
              {subImageText}
            </Typography>
          ) : null}
        </Stack>
      </DottedBox>
    </Stack>
  );
};

export default WebcamUploader;
