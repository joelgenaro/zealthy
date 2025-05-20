import { useIsMobile } from '@/components/hooks/useIsMobile';
import Box from '@mui/material/Box';
import React, { useCallback } from 'react';
import { everydayFavorites } from './programs-data';
import { Typography } from '@mui/material';
import Image from 'next/image';
import { useVisitActions } from '@/components/hooks/useVisit';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

const EverydayFavoritesCarousel = () => {
  const isMobile = useIsMobile();
  const { addMedication } = useVisitActions();

  const handleClick = useCallback(
    async (item: any) => {
      addMedication(item);
      Router.push(`${Pathnames.CHECKOUT}/everyday-favorites-checkout`);
    },
    [addMedication]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        py: 1,
        px: 1,
        overflow: 'auto',
        width: `${isMobile ? '350px' : '800px'}`,
        scrollSnapType: 'x mandatory',
        '& > *': {
          scrollSnapAlign: 'center',
        },
        '::-webkit-scrollbar': {
          display: isMobile ? 'none' : '',
          color: 'black',
        },
      }}
    >
      {everydayFavorites?.map((item, idx) => (
        <Box
          key={idx}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            borderRadius: '14px',
            gap: '0.5rem',
            boxShadow: '0px 0px 4px 1px rgba(0, 0, 0, 0.10)',
            cursor: 'pointer',
            height: '320px',
            width: '400px!important',
            padding: '20px',
          }}
          onClick={() => handleClick(item)}
        >
          <Typography
            variant="h4"
            fontSize="1rem!important"
          >{`$${item.price}`}</Typography>
          <Image alt={item.name} src={item.image} width={140} height={150} />
          <Typography variant="h3" fontSize="1.3rem!important" width="170px">
            {item.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default EverydayFavoritesCarousel;
