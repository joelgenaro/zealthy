import { useAppStateContext } from '@/context/AppContext';
import { IAppState } from '@/context/AppContext/reducers/types/appState';

export const useSelector = <T>(selector: (store: IAppState) => T) => {
  const store = useAppStateContext();

  return selector(store);
};
