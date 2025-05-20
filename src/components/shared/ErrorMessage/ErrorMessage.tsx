import { ReactNode } from 'react';
import CustomText from '../Text';
import { useLanguage } from '@/components/hooks/data';

interface ErrorMessageProps {
  children: ReactNode;
  bold?: boolean;
}

const ErrorMessage = ({ children }: ErrorMessageProps) => {
  const lan = useLanguage();

  const getTranslatedMessage = (message: string) => {
    if (lan !== 'esp') return message;

    const translations: Record<string, string> = {
      'Please choose the image': 'Por favor seleccione una imagen',
      'In order to proceed you will need to select the box above to confirm you have read the terms':
        'Para continuar, deberá seleccionar la casilla anterior para confirmar que ha leído los términos',
    };

    return translations[message] || message;
  };

  return (
    <CustomText textAlign="center" color="red">
      {typeof children === 'string' ? getTranslatedMessage(children) : children}
    </CustomText>
  );
};

export default ErrorMessage;
