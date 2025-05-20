import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export default axiosInstance;
