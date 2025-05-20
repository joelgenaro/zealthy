import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState, useEffect } from 'react';

interface LoadingResultsProps {
  nextPage: (nextPage?: string) => void;
}
const LoadingResults = ({ nextPage }: LoadingResultsProps) => {
  const isMobile = useIsMobile();

  const output: string[] = [
    'Gathering your responses',
    'Calculating your scores',
    'Preparing your results',
  ];

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [finishedLoading, setFinishedLoading] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }, 1333);

    setTimeout(() => {
      clearInterval(intervalId);
      setFinishedLoading(true);
    }, 4000);
    if (finishedLoading) {
      setTimeout(() => {
        nextPage();
      }, 1500);
    }
    return () => clearInterval(intervalId);
  }, [output.length, nextPage, finishedLoading]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

        height: '100vh',

        marginTop: isMobile ? '100px' : '0px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'baseline',
        }}
      >
        <Typography
          variant={isMobile ? 'h1' : 'h2'}
          fontFamily={'Arial'}
          fontWeight={600}
          fontSize={isMobile ? '2.1rem' : 'inherit'}
        >
          Loading your results
        </Typography>
        <Box sx={{ marginTop: '13%' }}>
          {output.map((el: string, index: number) => (
            <Box
              key={el}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                borderRadius: '20px',
                backgroundColor: '#C0C0C0',
                color: 'black',
                whiteSpace: 'nowrap',

                transition: 'opacity 1s',
                opacity: finishedLoading || index <= currentIndex ? 1 : 0,
                marginBottom: isMobile ? '23px' : '30px',
                marginRight: '0',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.2em',
                  fontWeight: 'bold',
                  color: '#333',
                  paddingX: isMobile ? '8px' : '13px',
                  paddingY: isMobile ? '10px' : '5px',
                }}
              >
                {el}
              </Typography>
              <CheckCircleIcon
                sx={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: '100%',
                  marginLeft: '5px',
                  color: '#097969',
                  borderRadius: '50%',
                  fontSize: '2em',
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default LoadingResults;
