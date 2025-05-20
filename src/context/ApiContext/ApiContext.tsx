import { createContext, ReactNode, useContext } from 'react';
import axiosInstance from './apiClient';

export interface AxiosErrorResponse {
  error: string;
  message: string[];
  statusCode: number;
}

const ApiContext = createContext(axiosInstance);

interface ApiContextProviderProps {
  children: ReactNode;
}

const ApiContextProvider = ({ children }: ApiContextProviderProps) => {
  return (
    <ApiContext.Provider value={axiosInstance}>{children}</ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);

export default ApiContextProvider;
