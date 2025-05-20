import axios from 'axios';

const butlerClient = axios.create({
  baseURL: process.env.BUTLER_LAB_BASE_URL,
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${process.env.BUTLER_LAB_API_KEY}`,
  },
});

export default butlerClient;
