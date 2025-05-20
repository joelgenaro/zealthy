import React from 'react';
import List from '@mui/material/List';
import Option from './Option';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type GroupType<T> = {
  label: string;
  subLabel?: string;
  options: {
    value: T;
    label: string;
    subheader?: string | null;
  }[];
};

interface OptionsProps<T> {
  isSelected: (value: T) => boolean;
  groups: GroupType<T>[];
  onSelect: (value: T) => void;
}

const RadioOptionList = <T,>({
  groups,
  onSelect,
  isSelected,
}: OptionsProps<T>) => {
  return (
    <>
      {groups.map((g, i) => (
        <Stack key={i} spacing={2}>
          {(g.label || g.subLabel) && (
            <Stack spacing="4px">
              {g.label && <Typography variant="h3">{g.label}</Typography>}
              {g.subLabel && <Typography>{g.subLabel}</Typography>}
            </Stack>
          )}
          <List
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0',
            }}
          >
            {g.options.map((option, idx) => (
              <Option
                key={option.label + idx}
                value={option.value}
                label={option.label}
                subheader={option.subheader || ''}
                isSelected={isSelected}
                onChange={onSelect}
              />
            ))}
          </List>
        </Stack>
      ))}
    </>
  );
};

export default RadioOptionList;
