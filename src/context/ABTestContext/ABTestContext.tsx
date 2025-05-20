import { createContext, ReactNode, useContext, useMemo } from 'react';

type ABTestContextType = {
  isControl: boolean;
  isVariation1: boolean;
  isVariation2: boolean;
  isVariation3: boolean;
};

const ABTestContext = createContext<ABTestContextType>({
  isControl: false,
  isVariation1: false,
  isVariation2: false,
  isVariation3: false,
});

interface ApiContextProviderProps {
  children: ReactNode;
  value: string | null;
}

const ABTestContextProvider = ({
  children,
  value,
}: ApiContextProviderProps) => {
  console.log('VALUE', value);
  const valueObj = useMemo(
    () => ({
      isControl: value === 'Control',
      isVariation1: value === 'Variation-1',
      isVariation2: value === 'Variation-2',
      isVariation3: value === 'Variation-3',
    }),
    [value]
  );

  return (
    <ABTestContext.Provider value={valueObj}>{children}</ABTestContext.Provider>
  );
};

export const useVariant = () => useContext(ABTestContext);

export default ABTestContextProvider;
