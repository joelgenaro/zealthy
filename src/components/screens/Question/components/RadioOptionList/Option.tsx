import React, { useCallback, useMemo } from 'react';
import DOMPurify from 'dompurify';
import Box from '@mui/system/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';

interface OptionProps<T> {
  label: string;
  subLabel?: string;
  subheader?: string;
  value: T;
  isSelected: (value: T) => boolean;
  onChange: (value: T) => void;
}

const Option = <T,>({
  value,
  label,
  subheader,
  isSelected,
  onChange,
}: OptionProps<T>) => {
  const sanitizedLabel = useMemo(() => DOMPurify.sanitize(label), [label]);
  const sanitizedSubheader = useMemo(
    () => DOMPurify.sanitize(subheader || ''),
    [subheader]
  );

  const handleClick = useCallback(() => {
    onChange(value);
  }, [onChange, value]);

  const selected = useMemo(() => isSelected(value), [isSelected, value]);

  return (
    <ListItemButton
      selected={selected}
      onClick={handleClick}
      sx={{
        gap: '12px',
        boxShadow: selected ? '0 0 0 2px #00531B' : '0 0 0 1px #D3D6D8',
        borderRadius: '12px',
        padding: '4px 24px 4px 12px !important',
      }}
    >
      <Radio checked={selected} />
      {subheader ? (
        <Stack
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          flex="1"
        >
          <Box dangerouslySetInnerHTML={{ __html: sanitizedLabel }} />

          <Box dangerouslySetInnerHTML={{ __html: sanitizedSubheader }} />
        </Stack>
      ) : (
        <Box
          display="flex"
          justifyContent="space-between"
          flex="1"
          dangerouslySetInnerHTML={{ __html: sanitizedLabel }}
        />
      )}
    </ListItemButton>
  );
};

export default Option;
