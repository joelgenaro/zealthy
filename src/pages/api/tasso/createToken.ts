import axios from 'axios';
import { redis } from '@/lib/redis';

const TTL = 60 * 60 * 7; // 7 hours
const ENV = process.env.VERCEL_ENV || 'development';
const TOKEN_KEY = `tasso:authToken:${ENV}`;
const RATE_LIMIT_KEY = `tasso:rate-limit:${ENV}`;
const MAX_REQUESTS_PER_MINUTE = 20;
const RATE_LIMIT_TTL = 60; // 1 minute

export const createAuthToken = async () => {
  try {
    const cachedToken = await redis.get<string>(TOKEN_KEY);
    if (cachedToken) return cachedToken;

    const currentCount = await redis.incr(RATE_LIMIT_KEY);
    if (currentCount === 1) {
      await redis.expire(RATE_LIMIT_KEY, RATE_LIMIT_TTL);
    }

    if (currentCount > MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Rate limit exceeded for /authTokens (max 20/min)');
    }

    const credentials = {
      username: process.env.TASSO_USERNAME!,
      secret: process.env.TASSO_API_SECRET!,
    };
    const url = `${process.env.TASSO_ENVIRONMENT}/authTokens`;
    const response = await axios.post(url, credentials, {
      headers: { 'Content-Type': 'application/json' },
    });

    const token = response.data.results.idToken;
    await redis.set(TOKEN_KEY, token, { ex: TTL });
    return token;
  } catch (err) {
    console.error('Error creating token:', err);
    throw err;
  }
};
