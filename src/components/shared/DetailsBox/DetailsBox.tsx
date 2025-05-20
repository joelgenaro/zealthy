import PlusSign from '@/components/shared/icons/PlusSign';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DOMPurify from 'dompurify';
import { ChangeEvent, useEffect, useState } from 'react';

export interface DetailsBoxProps {
  name: string;
  value: string;
  checked: boolean;
  placeholder: string;
  setAnswer: (payload: string) => void;
}

const DetailsBox = ({
  name,
  value,
  checked,
  placeholder,
  setAnswer,
}: DetailsBoxProps) => {
  const [showBox, setShowBox] = useState(!checked);

  useEffect(() => {
    setShowBox(!checked);
  }, [checked]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAnswer(
      DOMPurify.sanitize(e.target.value, {
        USE_PROFILES: { html: false },
      })
    );
  };

  return (
    <Box>
      {showBox ? (
        <WhiteBox
          compact
          bgcolor="transparent"
          borderRadius="12px"
          borderColor="#1B1B1B"
          padding="20px 24px"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight="600">{name}</Typography>
          </Box>
          <TextField
            onChange={handleChange}
            value={value}
            fullWidth
            id="fullWidth"
            rows={4}
            multiline
            placeholder={placeholder}
            sx={{
              background: '#EEEEEE',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />
        </WhiteBox>
      ) : (
        <Button
          color="grey"
          onClick={() => setShowBox(true)}
          sx={{ width: '100%' }}
        >
          <Box display="flex" gap="16px" alignItems="center">
            <PlusSign />
            Add
          </Box>
        </Button>
      )}
    </Box>
  );
};

export default DetailsBox;
