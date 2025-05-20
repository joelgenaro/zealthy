import React, { createContext, useContext, useState, ReactNode } from 'react';

type VisitTypeContextProps = {
  selectedVisitType: string | null;
  setSelectedVisitType: React.Dispatch<React.SetStateAction<string | null>>;
};

const VisitTypeContext = createContext<VisitTypeContextProps | undefined>(
  undefined
);

export const VisitTypeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedVisitType, setSelectedVisitType] = useState<string | null>(
    null
  );

  return (
    <VisitTypeContext.Provider
      value={{ selectedVisitType, setSelectedVisitType }}
    >
      {children}
    </VisitTypeContext.Provider>
  );
};

export const useVisitTypeContext = () => {
  const context = useContext(VisitTypeContext);
  if (!context) {
    throw new Error(
      'useVisitTypeContext must be used within a VisitTypeProvider'
    );
  }
  return context;
};
