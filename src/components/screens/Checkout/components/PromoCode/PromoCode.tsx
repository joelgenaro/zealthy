import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DOMPurify from 'dompurify';
import { ChangeEventHandler, useState } from 'react';

interface PromoCodeProps {
  onApply: (code: string) => void;
  coupon?: string;
}

const PromoCode = ({ onApply, coupon }: PromoCodeProps) => {
  const [code, setCode] = useState(coupon || '');

  const onClick = () => {
    // verify code is valid

    // apply code
    onApply(
      DOMPurify.sanitize(code, {
        USE_PROFILES: { html: false },
      })
    );
  };

  const handleCodeChange: ChangeEventHandler<HTMLInputElement> = e => {
    setCode(e.target.value);
  };

  return (
    <Box display="flex" alignItems="center" gap="16px">
      <TextField
        label="Enter promo code"
        variant="outlined"
        value={code}
        fullWidth
        onChange={handleCodeChange}
        required
      />
      <Button
        onClick={onClick}
        sx={{ textTransform: 'none', minWidth: 'fit-content' }}
      >
        Apply code
      </Button>
    </Box>
  );
};

export default PromoCode;
