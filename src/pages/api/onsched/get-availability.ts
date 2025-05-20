import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { addHours, addMonths, format } from 'date-fns';
import axios from 'axios';

function roundToNearest30Minutes(date: Date) {
  const roundedDate = new Date(date);
  const minutes = roundedDate.getMinutes();

  // Round to nearest 30 minutes or 0 minutes
  if (minutes < 15) {
    roundedDate.setMinutes(0);
  } else if (minutes < 45) {
    roundedDate.setMinutes(30);
  } else {
    roundedDate.setMinutes(0);
    roundedDate.setHours(roundedDate.getHours() + 1);
  }

  const remainder = roundedDate.getMinutes() % 5;
  if (remainder !== 0) {
    roundedDate.setMinutes(roundedDate.getMinutes() + (5 - remainder));
  }

  roundedDate.setSeconds(0, 0);
  return roundedDate;
}

interface IDItem {
  resourceId: string;
  email: string;
}

interface ScheduleSlot {
  resourceId: string;
  date: string;
  startDateTime: string;
  endDateTime: string;
}

interface Participant {
  resourceId: string;
  timezone: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { ids, duration, start } = req.body as {
    ids: IDItem[];
    duration: number;
    start?: string;
  };

  if (!ids || ids.length === 0) {
    return res.json([]);
  }

  try {
    createServerSupabaseClient<Database>({ req, res });

    const participants: Participant[] = ids.map(({ resourceId }) => ({
      resourceId,
      timezone: 'America/New_York',
    }));

    const tokenUrl = `${process.env.ONSCHED_TOKEN_URL}/connect/token`;
    const tokenParams = new URLSearchParams();
    tokenParams.set('client_id', process.env.ONSCHED_CLIENT_ID || '');
    tokenParams.set('client_secret', process.env.ONSCHED_CLIENT_SECRET || '');
    tokenParams.set('scope', 'OnSchedApi');
    tokenParams.set('grant_type', 'client_credentials');

    const tokenResp = await axios.post(tokenUrl, tokenParams, {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    const token = tokenResp.data.access_token as string;
    if (!token) {
      throw new Error('Failed to retrieve token');
    }

    const startDate = start ? new Date(start) : new Date();
    const oneMonthLater = addMonths(startDate, 1);
    const requestStartDate = format(startDate, 'yyyy-MM-dd');
    const requestEndDate = format(oneMonthLater, 'yyyy-MM-dd');
    const baseUrl = `${process.env.ONSCHED_BASE_URL}/consumer/v1/availability/${process.env.ONSCHED_SERVICE_ID}/${requestStartDate}/${requestEndDate}`;

    const scheduleMap: Record<
      string,
      { day: string; start: string; end: string }[]
    > = {};

    await Promise.allSettled(
      participants.map(async participant => {
        const startTimeNum = Number(
          format(
            roundToNearest30Minutes(
              start ? new Date(start) : addHours(new Date(), 3)
            ),
            'HHmm'
          )
        );

        try {
          const cal = await axios.get(baseUrl, {
            headers: {
              'content-type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            params: {
              ...participant,
              startTime: startTimeNum,
              duration,
            },
          });

          if (Array.isArray(cal?.data?.availableTimes)) {
            for (const slot of cal.data.availableTimes as ScheduleSlot[]) {
              const email = ids.find(
                i => i.resourceId === slot.resourceId
              )?.email;
              if (email) {
                if (!scheduleMap[email]) {
                  scheduleMap[email] = [];
                }
                scheduleMap[email].push({
                  day: slot.date,
                  start: slot.startDateTime,
                  end: slot.endDateTime,
                });
              }
            }
          }
        } catch (err) {
          console.error('availabilityError', err);
          // We continue processing other participants even if one fails
        }
      })
    );

    res.status(200).json(scheduleMap);
  } catch (error: any) {
    console.error('get-avail_err', error);
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
