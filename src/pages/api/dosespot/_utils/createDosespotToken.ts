import axios from 'axios';

type DosespotToken = {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  userName: string;
  '.issued': Date;
  '.expires': Date;
};

export const createDosespotToken = async () => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Subscription-Key': process.env.DOSESPOT_SUBSCRIPTION_KEY,
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
        accept: 'application/json; charset=utf-8',
      },
      data: {
        grant_type: 'password',
        client_id: process.env.DOSESPOT_CLINIC_ID,
        client_secret: process.env.DOSESPOT_CLINIC_KEY,
        username: process.env.DOSESPOT_USER_ID,
        password: process.env.DOSESPOT_CLINIC_KEY,
        scope: 'api',
      },
      url: `${process.env.DOSESPOT_BASE_URL!}/webapi/v2/connect/token`,
    };

    const res = await axios<DosespotToken>(options);
    return res;
  } catch (err: any) {
    throw err?.message || 'There was an unexpected error';
  }
};
