import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CompletedSign from './CompletedSign';
import UncompletedSign from './UncompletedSign';

interface TextItemProps {
  header: string;
  body: string;
  body2?: string;
  body3?: string;
  hasCompleted: boolean;
  hasNext?: boolean;
}

const TextItem = ({
  header,
  body,
  body2,
  body3,
  hasCompleted,
  hasNext = true,
}: TextItemProps) => {
  return (
    <Stack direction="row">
      {hasCompleted ? (
        <CompletedSign />
      ) : (
        <UncompletedSign hasDivider={hasNext} />
      )}
      <Stack direction="column" gap="16px">
        <Typography variant="h2" color={hasCompleted ? '#005315' : '#1b1b1b'}>
          {header}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: '300' }}>
          {body}
        </Typography>
        {body2 ? (
          <Typography variant="body1" sx={{ fontWeight: '300' }}>
            {body2}
          </Typography>
        ) : null}
        {body3 ? (
          <Typography variant="body1" sx={{ fontWeight: '300' }}>
            {body3}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
};

export default TextItem;
