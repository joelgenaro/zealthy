import { IPatient } from '@/types/patient';
import { createContext, ReactNode, useContext, useState } from 'react';

const PatientContext = createContext<IPatient | null>(null);

export const usePatientContext = () => useContext(PatientContext);

interface PatientContextProviderProps {
  children: ReactNode;
  initialState: IPatient;
}

const PatientContextProvider = ({
  children,
  initialState,
}: PatientContextProviderProps) => {
  const [patient, _] = useState(initialState);
  return (
    <PatientContext.Provider value={patient}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContextProvider;
