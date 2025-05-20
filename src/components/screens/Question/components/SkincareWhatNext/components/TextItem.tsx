import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CompletedSign from './CompletedSign';
import UncompletedSign from './UncompletedSign';

type Item = {
  header: string;
  description: string;
  hasCompleted: boolean;
  inProgress: boolean;
  image: () => JSX.Element;
  badge?: {
    color: string;
    text: string;
  };
};

interface TextItemProps {
  item: Item;
  hasNext?: boolean;
}

const TextItem = ({ hasNext = true, item }: TextItemProps) => {
  const { hasCompleted, inProgress, header, description, badge, image } = item;
  return (
    <Stack direction="row" gap="16px">
      {hasCompleted ? (
        <CompletedSign Icon={image} />
      ) : (
        <UncompletedSign
          hasDivider={hasNext}
          inProgress={inProgress}
          Icon={image}
        />
      )}

      <Stack
        direction="column"
        gap="16px"
        borderRadius="8px"
        border="0.5px solid #A7D2B5"
        bgcolor={hasCompleted || inProgress ? '#EBFEF1' : 'transparent'}
        padding="12px 16px"
        width="100%"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h3" color={hasCompleted ? '#005315' : '#1b1b1b'}>
            {header}
          </Typography>
          {badge ? (
            <Typography
              variant="body1"
              sx={{
                fontSize: '12px !important',
                lineHeight: '16px !important',
                fontWeight: '500',
                letterSpacing: '-0.006em',
                color: '#231A04',
                borderRadius: '38px',
                background: badge.color,
                padding: '3px 12px',
              }}
            >
              {badge.text}
            </Typography>
          ) : null}
        </Stack>
        <Typography variant="body1" sx={{ fontWeight: '300' }}>
          {description}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default TextItem;
