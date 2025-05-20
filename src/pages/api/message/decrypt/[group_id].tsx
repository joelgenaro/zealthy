import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Function to fetch encrypted data and decrypt it using the PostgreSQL function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { group_id } = req.query;
  const { page = 1, pageSize = 10 } = req.query;

  // Ensure it's a GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = supabaseAdmin;

  try {
    // Fetch encrypted messages from Supabase
    const { data: messages, error: fetchError } = await supabase
      .from('messages-v2')
      .select(
        `*,
          sender!inner(*),
          recipient!inner(*),
          messages_group_id(*)`
      )
      .eq('messages_group_id', group_id as string)
      .order('created_at', { ascending: false })
      .range((+page - 1) * +pageSize, +page * +pageSize - 1);

    if (fetchError) {
      return res.status(500).json({ error: 'Error fetching messages' });
    }

    if (!messages) {
      return res.status(404).json({ error: 'No messages found' });
    }

    // Decrypt each message by calling the PostgreSQL decryption function
    const decryptedMessages = await Promise.all(
      messages.map(async message => {
        // Sanitize the encrypted message by removing line breaks or any extra spaces
        const sanitizedMessage = message?.message_encrypted?.replace(/\n/g, '');
        const { data: decryptedMessage, error: decryptError } =
          await supabase.rpc('decrypt_message', {
            message_encrypted: sanitizedMessage!, // Pass the sanitized message
          });

        if (decryptError) {
          return { ...message, decrypted_message_encrypted: null };
        }

        return {
          ...message,
          decrypted_message_encrypted: decryptedMessage, // Add the decrypted message to the response
        };
      })
    );

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error('Error fetching/decrypting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
