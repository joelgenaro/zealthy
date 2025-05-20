import React from 'react';
import { render, screen } from '@testing-library/react';
import { useApi } from '@/context/ApiContext';
import ApiContextProvider from '@/context/ApiContext/ApiContext';
import axiosInstance from '@/context/ApiContext/apiClient';

describe('ApiContextProvider', () => {
  it('renders its children', () => {
    render(
      <ApiContextProvider>
        <div>Test Child</div>
      </ApiContextProvider>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
  it('provides the axios instance', () => {
    const TestComponent = () => {
      const api = useApi();
      expect(api).toBe(axiosInstance);
      return null;
    };
    render(
      <ApiContextProvider>
        <TestComponent />
      </ApiContextProvider>
    );
  });
});
