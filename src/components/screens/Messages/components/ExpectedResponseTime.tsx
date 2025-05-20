import { Database } from '@/lib/database.types';
import { Box, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { differenceInHours } from 'date-fns';
import { useEffect, useState } from 'react';

export function ExpectedResponseTime({ show }: { show: boolean }) {
  const supabase = useSupabaseClient<Database>();
  const [timeRange, setTimeRange] = useState<string>('1-2 days');
  const [loading, setLoading] = useState<boolean>(true);

  const hide = loading || !show;

  async function fetchOldestUnassignedTask() {
    await supabase
      .from('task_queue')
      .select('*')
      .is('completed_at', null)
      .is('assigned_clinician_id', null)
      .is('forwarded_task_id', null)
      .eq('visible', true)
      .eq('task_type', 'UNREAD_MESSAGE')
      .neq('queue_type', 'Provider')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const ageInHours = differenceInHours(
          new Date(),
          new Date(data.created_at)
        );
        if (ageInHours < 4) {
          setTimeRange('a few hours to a day');
        } else if (ageInHours >= 48) {
          setTimeRange('2-3 days');
        }
      });

    setLoading(false);
  }

  useEffect(() => {
    if (loading) {
      fetchOldestUnassignedTask();
    }
  }, [loading]);

  return (
    <Box
      sx={{
        display: 'flex',
        color: 'black',
        width: 'fit-content',
        margin: '1px auto 10px',
        textAlign: 'center',
        border: '1px solid #535353',
        borderRadius: '20px',
        padding: '2px 5px',
        opacity: hide ? 0 : 1,
        transition: 'all 0.5s ease',
      }}
    >
      <Typography variant="h4">Expected response time: {timeRange}</Typography>
    </Box>
  );
}
