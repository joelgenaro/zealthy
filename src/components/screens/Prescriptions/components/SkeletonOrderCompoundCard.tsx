import { Card, CardContent, Skeleton } from '@mui/material';
import { Box, Stack } from '@mui/system';
import React from 'react';

function SkeletonOrderCompoundCard() {
  return (
    <Card
      sx={{
        width: '100%',
        marginBottom: '1rem',
        borderRadius: '1rem',
        position: 'relative',
        height: '600px',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          '& p': {
            margin: '3px 0',
          },
        }}
      >
        <Box
          sx={{
            height: '26px',
            borderRadius: '12px',
            padding: '5px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <Skeleton animation="wave" width="100%" />
        </Box>
        <Stack sx={{ gap: '0.15rem' }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: '0.375rem',
            }}
          >
            <Skeleton animation="wave" />

            <Skeleton animation="wave" />

            <Skeleton animation="wave" />
          </Box>
          <Skeleton animation="wave" width="100%" height={300} />
        </Stack>
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              flexBasis: 'calc(50% - 1rem)',
            }}
          >
            <Skeleton animation="wave" />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                flexBasis: 'calc(50% - 1rem)',
              }}
            >
              <Skeleton animation="wave" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                flexBasis: 'calc(50% - 1rem)',
              }}
            >
              <Skeleton animation="wave" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                flexBasis: 'calc(50% - 1rem)',
              }}
            >
              <Skeleton animation="wave" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                flexBasis: 'calc(50% - 1rem)',
              }}
            >
              <Skeleton animation="wave" />
            </Box>
          </Box>
        </>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Skeleton animation="wave" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default SkeletonOrderCompoundCard;
