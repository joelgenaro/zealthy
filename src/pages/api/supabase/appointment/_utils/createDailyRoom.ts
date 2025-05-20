import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import axios from 'axios';

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const createDailyRoom = async (appointment: Appointment) => {
  try {
    const apiUrl = 'https://api.daily.co/v1/rooms/';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    };

    const requestBody = {
      privacy: 'private',
      properties: {
        enable_prejoin_ui: true,
        enable_knocking: true,
        enable_breakout_rooms: false,
        enable_chat: true,
        enable_advanced_chat: true,
        enable_emoji_reactions: true,
        enable_people_ui: true,
        enable_network_ui: false,
        enable_noise_cancellation_ui: false,
        enable_hand_raising: false,
        enable_video_processing_ui: false,
      },
    };

    const { data } = await axios.post(apiUrl, requestBody, { headers });

    if (!data.url) {
      throw new Error(
        `Could not generate token for appointment: ${appointment.id}`
      );
    }

    const pathIndex = data.url.lastIndexOf('/');
    const code = data.url.slice(pathIndex + 1);

    return supabaseAdmin
      .from('appointment')
      .update({
        daily_room: code,
      })
      .eq('id', appointment.id)
      .select('*')
      .maybeSingle()
      .throwOnError()
      .then(({ data }) => data);
  } catch (err) {
    throw err;
  }
};
