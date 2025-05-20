import { useSearchParams } from 'next/navigation';
import { Pathnames } from '@/types/pathnames';
import { Button, Typography, ListItemButton, Stack } from '@mui/material';
import Router from 'next/router';
import { useState } from 'react';

interface Option {
  name: string;
  onClick: () => void;
}

const LabWork = () => {
  const searchParams = useSearchParams();
  const labOrderId = searchParams?.get('id');
  const [selected, setSelected] = useState<Option | null>(null);

  const handleOnChange = (value: Option) => {
    setSelected(value);
  };
  const handleContinue = () => {
    selected?.onClick();
  };

  return (
    <Stack gap={{ sm: 6, xs: 3 }}>
      <Stack gap={2}>
        <Typography variant="h2">
          {`Zealthy needs lab work from you to determine the best treatment plan
          moving forward.`}
        </Typography>
        <Typography>
          {`If you've recently completed lab work, you can upload it for your
          provider. If not, schedule lab work at a Quest Diagnostics or Labcorp
          location near you.`}
        </Typography>
      </Stack>
      <Stack gap={2}>
        <ListItemButton
          onClick={() =>
            handleOnChange({
              name: 'upload',
              onClick: () =>
                Router.push(
                  `${Pathnames.LAB_WORK_UPLOAD}${
                    labOrderId ? `?id=${labOrderId}` : ''
                  }`
                ),
            })
          }
          sx={{
            border: `1px solid ${
              selected?.name === 'upload' ? '#1B1B1B' : '#00000033'
            }`,
            borderRadius: '12px',
            paddingX: { md: '24px', xs: '16px' },
            paddingY: '20px',
          }}
        >
          {`Upload recent lab results`}
        </ListItemButton>
        <ListItemButton
          onClick={() =>
            handleOnChange({
              name: 'email',
              onClick: () => Router.push(Pathnames.LABCORP_EMAIL),
            })
          }
          sx={{
            border: `1px solid ${
              selected?.name === 'email' ? '#1B1B1B' : '#00000033'
            }`,
            borderRadius: '12px',
            paddingX: { md: '24px', xs: '16px' },
            paddingY: '20px',
          }}
        >
          {`Schedule lab work at Quest or Labcorp`}
        </ListItemButton>
      </Stack>
      <Button onClick={handleContinue}>Continue</Button>
    </Stack>
  );
};

export default LabWork;
