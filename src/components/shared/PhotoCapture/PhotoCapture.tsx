import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import { Box, Grid, Typography } from '@mui/material';

interface Props {
  text: string;
}

const PhotoCapture = ({ text }: Props) => {
  return (
    <Grid container maxWidth="450px" direction="column" gap="16px">
      <Box
        borderRadius="12px"
        height="260px"
        padding="12px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        border="1px dashed #1B1B1B"
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#EBEBEB',
          }}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CameraAltRoundedIcon fontSize="large" />
        </Box>
      </Box>
      <Grid container direction="row" gap="8px" justifyContent="center">
        <Typography fontWeight="400" variant="body1" textAlign="center">
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default PhotoCapture;
