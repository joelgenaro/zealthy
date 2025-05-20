import { useUser } from '@supabase/auth-helpers-react';
import { ReactElement } from 'react';
import DefaultNavLayout from './DefaultNavLayout';
import OnboardingLayout from './OnboardingLayout';

interface NavBarLayoutProps {
  children: ReactElement;
}

const NavBarLayout = ({ children }: NavBarLayoutProps) => {
  const user = useUser();
  if (user) {
    return <OnboardingLayout>{children}</OnboardingLayout>;
  }

  return <DefaultNavLayout>{children}</DefaultNavLayout>;
};

export default NavBarLayout;
