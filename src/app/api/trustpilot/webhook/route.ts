import { createTrustpilotToken } from '@/pages/api/trustpilot/createTrustpilotToken';
import { formatDate } from '@/utils/date-fns';
import { trustpilotReviewReceivedEvent } from '@/utils/freshpaint/events';
import { getServiceSupabase } from '@/utils/supabase';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const trustpilotCollectionMethod = (isVerified: boolean, tag?: string) => {
  if (isVerified) {
    switch (tag) {
      case 'Invitation-Link-API-Web':
        return 'API Web';
      case 'Invitation-Link-API-Mobile':
        return 'API Mobile';
      default:
        return 'TP email invitation';
    }
  } else {
    return 'Organic';
  }
};

export async function POST(request: NextRequest) {
  const supabase = getServiceSupabase();

  const body = await request.json();
  console.log('Recieved trustpilot webhook:', JSON.stringify(body, null, 2));

  try {
    for (const event of body.events) {
      if (event.eventName === 'service-review-created') {
        let profile = null;
        if (event.eventData.referenceId) {
          profile = await supabase
            .from('profiles')
            .select('*')
            .eq('id', event.eventData.referenceId)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) {
                console.error(`TrustPilotWebhookError`, error);
              }

              return data || null;
            });
        } else {
          console.log('Review does not have a reference id', event);
          try {
            console.log('Creating trustpilot token');
            const { access_token } = await createTrustpilotToken();
            console.log('Token created', access_token);
            const { data } = await axios.get(
              `https://${process.env.TRUSTPILOT_BASE_URL}/v1/private/reviews/${event.eventData.id}`,
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            console.log('Review data', data);
            if (data?.findReviewer?.referralEmail) {
              console.log('Finding profile');
              profile = await supabase
                .from('profiles')
                .select('*')
                .eq('email', data?.findReviewer?.referralEmail)
                .maybeSingle();
              console.log('Profile found', profile);
            }
          } catch (err) {
            console.error('Error fetching profile', err);
          }
        }
        console.log('Trustpilot review received event');

        await trustpilotReviewReceivedEvent(
          trustpilotCollectionMethod(
            event.eventData.isVerified,
            event.eventData.tags?.[0]?.value || ''
          ),
          event.eventData.stars,
          event.eventData.consumer.name,
          formatDate(event.eventData.createdAt),
          profile?.email || 'tpemail@getzealthy.com',
          profile?.id
        );
        console.log('Trustpilot review received event completed');
      }

      console.log('Webhook received and event fired successfully');
    }
    return NextResponse.json(
      { message: 'Successfully completed trustpilot event loops' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error processing webhook:', { Error: err });
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: 'There was an unexpected error',
      },
      { status: 500 }
    );
  }
}
