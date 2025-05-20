import axios from 'axios';

const enterClient = axios.create({
  baseURL: process.env.ENTER_BASE_URL,
  timeout: 30000,
  headers: {
    apiKey: process.env.ENTER_API_KEY,
    'Content-Type': 'application/json',
  },
});

export default enterClient;
