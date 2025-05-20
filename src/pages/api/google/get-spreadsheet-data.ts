import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import credentials from 'google-credentials.json';

export default async function GogoMedsWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { sheetId, range } = req.body;

    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets('v4');
    const result = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId: sheetId,
      range,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.log(error?.message, 'error');
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
