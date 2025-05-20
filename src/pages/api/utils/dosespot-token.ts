import * as crypto from 'crypto';
import axios from 'axios';

function randomString(len: number): string {
  const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return [...Array(len)].reduce(a => a + p[~~(Math.random() * p.length)], '');
}

const generateClinicAndUserHashB64 = (userId: string, clinicKey: string) => {
  const randomPhrase = randomString(32);

  const userIdHash = crypto
    .createHash('sha512')
    .update(userId + randomPhrase.slice(0, 22) + clinicKey)
    .digest('base64');

  const clinicIdHash =
    randomPhrase +
    crypto
      .createHash('sha512')
      .update(randomPhrase + clinicKey)
      .digest('base64');

  return {
    userIdHash: userIdHash.slice(0, userIdHash.length - 2),
    clinicIdHash: clinicIdHash.slice(0, clinicIdHash.length - 2),
  };
};

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
    const result = generateClinicAndUserHashB64(
      process.env.DOSESPOT_USER_ID!,
      process.env.DOSESPOT_CLINIC_KEY!
    );

    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
        accept: 'application/json; charset=utf-8',
      },
      data: {
        grant_type: 'password',
        Username: process.env.DOSESPOT_USER_ID!,
        Password: result.userIdHash,
      },
      auth: {
        username: process.env.DOSESPOT_CLINIC_ID!,
        password: result.clinicIdHash,
      },
      url: `${process.env.DOSESPOT_BASE_URL!}/webapi/token`,
    };

    return axios<DosespotToken>(options);
  } catch (err) {
    console.error('Error creating Dosespot Access token', err);
    throw err;
  }
};
