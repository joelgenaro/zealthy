import { useAppointmentState } from '@/components/hooks/useAppointment';
import { usePatientState } from '@/components/hooks/usePatient';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitState } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import { useRouter } from 'next/router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PatientStatus } from '../AppContext/reducers/types/patient';
import getPostCheckoutLinks from './getPostCheckoutLinks';

type NavigationContextType = {
  next: string;
  toNext: (current: Pathnames) => Pathnames;
  isPostCheckout: boolean;
};

const NavigationContext = createContext<NavigationContextType>({
  next: '',
  toNext: (current: Pathnames) => '' as Pathnames,
  isPostCheckout: false,
});

interface PostCheckoutNavigationProps {
  children: React.ReactNode;
}

export const usePostCheckoutNavigation = () => useContext(NavigationContext);

const PostCheckoutNavigation = ({ children }: PostCheckoutNavigationProps) => {
  const [current, setCurrent] = useState(0);
  const visit = useVisitState();
  const patient = usePatientState();
  const coaching = useSelector(store => store.coaching);
  const appointments = useAppointmentState();
  // const { hasINInsurance } = useInsuranceState();
  const { pathname } = useRouter();
  const { status } = usePatientState();

  const navigableLinks = useMemo(
    () =>
      getPostCheckoutLinks({
        visit,
        coaching,
        appointments,
        reasons: visit.selectedCare.careSelections,
        patient,
      }),
    [appointments, visit, patient]
  );

  // const toNext = useCallback(() => {
  //   const navigableLinks = getPostCheckoutLinks({
  //     visit,
  //     appointments,
  //     reasons: visit.selectedCare.careSelections,
  //   });

  //   return status === PatientStatus.PAYMENT_SUBMITTED
  //     ? navigableLinks[current + 1]
  //     : "";
  // }, [visit, appointments, status, current]);

  // post checkout questionnaires
  const toNext = useCallback(
    (currentPath: Pathnames) => {
      const index = navigableLinks.indexOf(currentPath);
      return navigableLinks[index + 1];
    },
    [navigableLinks]
  );

  const values = useMemo(
    () => ({
      toNext,
      next:
        status === PatientStatus.PAYMENT_SUBMITTED
          ? navigableLinks[current + 1]
          : '',
      isPostCheckout: status === PatientStatus.PAYMENT_SUBMITTED,
    }),
    [current, navigableLinks, status, toNext]
  );

  useEffect(() => {
    const index = navigableLinks.indexOf(pathname as Pathnames);
    setCurrent(index);
  }, [pathname, navigableLinks]);

  return (
    <NavigationContext.Provider value={values}>
      {children}
    </NavigationContext.Provider>
  );
};

export default PostCheckoutNavigation;
