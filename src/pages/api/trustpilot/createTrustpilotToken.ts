import axios from 'axios';

export const createTrustpilotToken = async () => {
  try {
    const credentials = `${process.env.TRUSTPILOT_API_KEY}:${process.env.TRUSTPILOT_API_SECRET}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    const data = `grant_type=password&username=${encodeURIComponent(
      process.env.TRUSTPILOT_USERNAME!
    )}&password=${encodeURIComponent(process.env.TRUSTPILOT_PASSWORD!)}`;

    const options = {
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const url = `https://${process.env.TRUSTPILOT_BASE_URL}/v1/oauth/oauth-business-users-for-applications/accesstoken`;
    const response = await axios.post(url, data, options);
    return response.data;
  } catch (err: any) {
    throw err?.message || 'There was an unexpected error';
  }
};
