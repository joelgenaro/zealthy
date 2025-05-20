import { AxiosStatic } from 'axios';

const axiosMock = jest.createMockFromModule<AxiosStatic>('axios');
axiosMock.create = jest.fn(() => axiosMock);

export default axiosMock;
