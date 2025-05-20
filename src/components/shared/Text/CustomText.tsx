import { useLanguage } from '@/components/hooks/data';
import { Typography } from '@mui/material';
import { TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
}

const CustomText = ({ children, ...props }: TextProps & TypographyProps) => {
  const language = useLanguage();
  let text = children;

  if (language === 'esp' && children === 'Your card number is invalid.') {
    text = 'Tu numero de tarjeta no es valido.';
  }

  return (
    <Typography
      color="#1B1B1B"
      letterSpacing="-0.006em"
      lineHeight="1.5rem"
      fontWeight="400"
      fontStyle="normal"
      whiteSpace="pre-line"
      {...props}
    >
      {text}
    </Typography>
  );
};

export default CustomText;
