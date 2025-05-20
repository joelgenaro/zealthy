import { ReactNode } from 'react';
import CustomText from '../Text/CustomText';

interface SubHeadingProps {
  children: ReactNode;
}

const SubHeading = ({ children }: SubHeadingProps) => {
  return (
    <CustomText
      variant="h6"
      fontWeight="600"
      lineHeight="28px"
      letterSpacing="0.01em"
    >
      {children}
    </CustomText>
  );
};

export default SubHeading;
