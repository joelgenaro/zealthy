import { Button, Tooltip } from '@mui/material';
import React from 'react';
import { useLanguage } from '@/components/hooks/data';

const LanguageButton = () => {
  const language = useLanguage();

  const handleClick = () => {
    if (typeof window != 'undefined') {
      const newLanguage = language === 'esp' ? 'en' : 'esp';
      sessionStorage.setItem('language', newLanguage);

      // Triggering the event so language is updated correctly in the useLanguage hook
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <Tooltip
      title={`${
        language === 'esp' ? 'Continue in English?' : 'Continuar en Españo?'
      }`}
      placement="top"
      arrow
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -25],
              },
            },
          ],
        },
      }}
    >
      <Button
        variant="text"
        onClick={handleClick}
        sx={{
          ':hover': {
            backgroundColor: 'inherit', // Keeps the background color the same
          },
          padding: 0,
          margin: 0,
          minWidth: 0,
          color: '#808080',
        }}
      >
        {language === 'esp' ? 'Continuar en Inglés?' : 'Continue in Spanish'}
      </Button>
    </Tooltip>
  );
};

export default LanguageButton;
