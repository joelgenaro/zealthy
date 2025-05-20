import { useRouter } from 'next/router';

export const useIsPortal = () => {
  const router = useRouter();
  const isPortal = router.pathname.includes('/patient-portal');

  return isPortal;
};
