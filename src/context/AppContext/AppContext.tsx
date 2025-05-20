import { useUpdateEffect } from '@/components/hooks/useUpdateEffect';
import { Database } from '@/lib/database.types';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import {
  createContext,
  useContext,
  Dispatch,
  useEffect,
  useState,
  useReducer,
  useRef,
} from 'react';
import { useInitialState } from './hooks/useInitialState';
import rootReducer from './reducers';
import { IAppActions, IAppState } from './reducers/types/appState';
import { CommonActionTypes } from './reducers/types/common';
import axios from 'axios';
import type BranchProps from 'branch-sdk';

export const AppStateContext = createContext<IAppState>(rootReducer[1]);

const AppDispatchContext = createContext<Dispatch<IAppActions>>(() => {});

export function useAppStateContext() {
  return useContext(AppStateContext);
}

export function useAppDispatchContext() {
  return useContext(AppDispatchContext);
}

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(rootReducer[0], rootReducer[1]);
  const { setInitialState, resetState, updateLocalState } = useInitialState();
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let Branch: typeof BranchProps | null = null;

  const getBranchSdkAsync = async () => {
    try {
      const { default: BranchSdk } = await import('branch-sdk');
      Branch = BranchSdk;
    } catch (error) {
      console.error(error);
    }
  };

  // we need it to stop infinite fetching
  const beforeState = useRef(state);

  //since we move to session storage we will need to remove store from local storage
  // we will remove this code eventually
  useEffect(() => {
    //clear local storage
    localStorage.removeItem('zealthy-app-state');

    getBranchSdkAsync();
  }, []);

  useUpdateEffect(() => {
    if (user) {
      updateLocalState(state);
    }
  }, [state, user]);

  // update state before user sign-in
  useEffect(() => {
    if (!user) beforeState.current = state;
  }, [user, state]);

  useEffect(() => {
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
          event === 'SIGNED_IN' &&
          session?.user.email
        ) {
          window.freshpaint?.identify(session.user.id, {
            email: session.user.email,
            timezone: timezone,
          });

          if (Branch) {
            Branch.setIdentity(session.user.id);
          }

          setTimeout(() => {
            axios.post(`/api/cio/merge-duplicate`, {
              profileId: session.user.id,
              email: session.user.email,
            });
          }, 8000);
        }

        if (event === 'SIGNED_IN') {
          if (session) {
            setInitialState(session.user, beforeState.current).then(
              initialState => {
                dispatch({
                  type: CommonActionTypes.INIT,
                  payload: initialState,
                });
                setLoading(false);
              }
            );
          }
          return;
        }

        if (event === 'INITIAL_SESSION') {
          if (session) {
            setInitialState(session.user, beforeState.current).then(
              initialState => {
                dispatch({
                  type: CommonActionTypes.INIT,
                  payload: initialState,
                });
                setLoading(false);
              }
            );
          } else {
            resetState();
            beforeState.current = rootReducer[1];
            dispatch({
              type: CommonActionTypes.INIT,
              payload: rootReducer[1],
            });
            setLoading(false);
          }
        }

        if (event === 'SIGNED_OUT') {
          resetState();
          sessionStorage.removeItem('isDrawerOpen');

          if (Branch) {
            Branch.logout();
          }

          beforeState.current = rootReducer[1];
          dispatch({
            type: CommonActionTypes.INIT,
            payload: rootReducer[1],
          });
          setLoading(false);
        }
      }
    );

    return () => authSubscription.subscription.unsubscribe();
  }, [resetState, setInitialState, supabase.auth, beforeState, timezone]);

  if (loading) return null;

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

export default AppContextProvider;
