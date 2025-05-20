import React from 'react';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface CardProps {
  avatar: string;
  rating: number;
  setRating: (num: number) => void;
  coachInfo: any;
  isMobile: boolean;
}

export const CoachCard = ({
  avatar,
  rating,
  setRating,
  coachInfo,
  isMobile,
}: CardProps) => {
  return (
    <Box>
      <Card>
        <React.Fragment>
          <CardContent>
            <Stack direction="row" gap={1}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  position: 'relative',
                  alignSelf: 'center',
                  display: 'inline-block',
                }}
              >
                <Image
                  layout="fill"
                  objectFit="cover"
                  alt="Care provider profile picture"
                  src={avatar || ProfilePlaceholder}
                  style={{
                    borderRadius: '50%',
                    margin: '0 auto',
                    display: 'block',
                    marginRight: '10px',
                  }}
                />
              </div>
              <Box
                sx={{
                  paddingTop: '15px',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" textAlign="center">
                  {`${coachInfo?.clinician?.profiles?.first_name} ${coachInfo?.clinician?.profiles?.last_name}`}
                </Typography>
              </Box>
            </Stack>

            <Stack alignItems="center">
              <Box paddingBottom={{ sm: 0, xs: '10px' }} paddingTop="0px">
                <Rating
                  name="simple-controlled"
                  value={rating}
                  size={'large'}
                  onChange={(event, newValue) => {
                    setRating(newValue || 0);
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </React.Fragment>
      </Card>
    </Box>
  );
};
