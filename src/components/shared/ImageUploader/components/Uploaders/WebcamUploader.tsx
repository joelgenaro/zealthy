import { Stack, Typography } from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import DottedBox from './DottedBox';

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
        {title ? <Typography variant="h3">{title}</Typography> : null}
        {subtitle ? <Typography>{subtitle}</Typography> : null}
      </Stack>
      <DottedBox onClick={onClick}>
        <CameraAltOutlinedIcon fontSize="large" />
      </DottedBox>

      {subImageText ? (
        <Typography variant="body2" component="p" sx={{ textAlign: 'center' }}>
          {subImageText}
        </Typography>
      ) : null}
    </Stack>
  );
};

export default WebcamUploader;
