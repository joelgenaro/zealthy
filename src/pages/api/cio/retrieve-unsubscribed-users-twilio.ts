import type { NextApiRequest, NextApiResponse } from 'next';
import Twilio from 'twilio';

type TwilioMessage = {
  sid: string;
  to: string;
  from: string;
  status: string;
  errorCode: string | number;
  dateSent: Date;
};

// This API endpoint retrieves messages from Twilio that have an error code of 21610,
// which indicates that the message was sent to an unsubscribed recipient.
// It then formats the phone numbers and returns them in a JSON response.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const client = Twilio(accountSid, authToken);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    console.log('Fetching messages from Twilio for the past 3 months...');

    let allMessages: TwilioMessage[] = [];
    let pageSize = 1000;
    let pageCount = 0;
    let hasMorePages = true;

    let currentPage = await client.messages.list({
      limit: pageSize,
      dateSentAfter: threeMonthsAgo,
    });

    while (currentPage.length > 0 && pageCount < 10) {
      pageCount++;
      console.log(
        `Processing page ${pageCount} with ${currentPage.length} messages...`
      );

      allMessages = [...allMessages, ...currentPage];

      if (currentPage.length < pageSize) {
        break;
      }

      const lastMessage = currentPage[currentPage.length - 1];

      currentPage = await client.messages.list({
        limit: pageSize,
        dateSentAfter: threeMonthsAgo,
        dateSentBefore: new Date(lastMessage.dateSent.getTime() - 1),
      });
    }

    console.log(`Total messages retrieved: ${allMessages.length}`);

    const filteredMessages: TwilioMessage[] = allMessages
      .filter(msg => {
        if (typeof msg.errorCode === 'string') {
          return msg.errorCode === '21610';
        } else if (typeof msg.errorCode === 'number') {
          return msg.errorCode === 21610;
        }
        return false;
      })
      .map(msg => ({
        sid: msg.sid,
        to: msg.to,
        from: msg.from,
        status: msg.status,
        errorCode: msg.errorCode?.toString() || '',
        dateSent: msg.dateSent,
      }));

    console.log(
      `Number of messages with error_code=21610: ${filteredMessages.length}`
    );

    const formattedPhoneNumbers =
      extractFormattedPhoneNumbers(filteredMessages);
    console.log(`Unique phone numbers found: ${formattedPhoneNumbers.length}`);

    const format = req.query.format as string;

    if (format === 'csv') {
      const csvContent = generateCsv(filteredMessages);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=twilio_errors_21610.csv'
      );
      return res.status(200).send(csvContent);
    } else if (format === 'phones') {
      return res.status(200).json({
        count: formattedPhoneNumbers.length,
        phoneNumbers: formattedPhoneNumbers.map(phone => `'${phone}'`),
      });
    } else {
      return res.status(200).json({
        count: filteredMessages.length,
        messages: filteredMessages,
      });
    }
  } catch (error) {
    console.error('Error fetching Twilio messages:', error);
    return res.status(500).json({
      error: 'Failed to fetch Twilio messages',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function generateCsv(messages: TwilioMessage[]): string {
  const header = 'sid,to,from,status,error_code,date_sent\n';

  const rows = messages
    .map(msg => {
      const escapeCsvField = (field: any) => {
        const stringField = String(field || '');
        if (
          stringField.includes(',') ||
          stringField.includes('"') ||
          stringField.includes('\n')
        ) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      return [
        escapeCsvField(msg.sid),
        escapeCsvField(msg.to),
        escapeCsvField(msg.from),
        escapeCsvField(msg.status),
        escapeCsvField(msg.errorCode),
        escapeCsvField(msg.dateSent),
      ].join(',');
    })
    .join('\n');

  return header + rows;
}

function extractFormattedPhoneNumbers(messages: TwilioMessage[]): string[] {
  const phoneNumbers = messages.map(msg => msg.to);

  const formattedNumbers = phoneNumbers.map(number => {
    const digitsOnly = number.replace(/\D/g, '');

    return digitsOnly.startsWith('1') ? `+${digitsOnly}` : `+1${digitsOnly}`;
  });

  const uniqueNumbers = [...new Set(formattedNumbers)];

  return uniqueNumbers;
}
