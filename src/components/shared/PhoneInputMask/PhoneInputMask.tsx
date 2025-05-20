import React, { useState, useEffect, forwardRef } from 'react';
import {
  MenuItem,
  Select,
  TextField,
  InputLabel,
  FormControl,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import {
  getAllCountryCodes,
  formatPhoneNumber,
  isValidPhoneNumber,
  formatToE164,
} from '@/utils/phone/phoneUtils';
import phoneCountryCodes from '@/constants/phone/phoneCountryCodes';

interface PhoneInputProps {
  onChange: (event: {
    target: { name: string | null; value: string | null };
  }) => void;
  name: string;
  value: string;
}

const PhoneInputMask = forwardRef<HTMLElement, PhoneInputProps>(
  function PhoneInputMask({ onChange, name, value, ...other }, ref) {
    const countryCodes = getAllCountryCodes();
    const [selectedCountry, setSelectedCountry] = useState('US'); // Default to US
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);

    // Format the phone number when country or input changes
    useEffect(() => {
      if (phoneNumber) {
        const formatted = formatPhoneNumber(phoneNumber, selectedCountry);
        setPhoneNumber(formatted);
        setIsValid(isValidPhoneNumber(formatted, selectedCountry));
      }
    }, [selectedCountry]);

    const handleCountryChange = (e: SelectChangeEvent<string>) => {
      setSelectedCountry(e.target.value as string);
      setPhoneNumber(''); // Reset phone number when country changes
      setIsValid(null);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
        .replace(/\D/g, '')
        .slice(
          0,
          phoneCountryCodes[selectedCountry as keyof typeof phoneCountryCodes]
        );
      setPhoneNumber(value);
      setIsValid(
        value
          ? isValidPhoneNumber(
              value,
              selectedCountry as keyof typeof phoneCountryCodes
            )
          : null
      );
      const E164 = formatToE164(value, selectedCountry);
      onChange({ target: { name, value: E164 } });
    };

    return (
      <div style={{ display: 'flex', width: '100%' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={selectedCountry}
            onChange={handleCountryChange}
            label="Country"
          >
            {countryCodes.map(({ regionCode, callingCode }) => (
              <MenuItem key={regionCode} value={regionCode}>
                {regionCode} (+{callingCode})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          style={{ width: '100%' }}
          label="Phone Number"
          value={phoneNumber}
          onChange={handlePhoneChange}
          fullWidth
          variant="outlined"
          error={isValid === false}
          type="tel"
          autoComplete="tel"
        />
      </div>
    );
  }
);

export default PhoneInputMask;
