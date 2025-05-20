import CheckMark from '@/components/shared/icons/CheckMark';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

type Props = {
  header?: string;
  listItems: string[];
};

const CheckmarkList = (props: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack gap={isMobile ? '0.5rem' : '0'}>
      {props.header && <Typography fontWeight="500">{props.header}</Typography>}
      <List
        sx={{
          padding: '0',
          display: 'flex',
          gap: isMobile ? '0.5rem' : '0.25rem',
          flexDirection: 'column',
          margin: '0.3rem 0 0 0.3rem',
        }}
      >
        {props.listItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <Box
              display="grid"
              gap="10px"
              gridTemplateColumns="20px 1fr"
              alignItems="center"
            >
              <CheckMark />
              <Typography>{item}</Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};

export default CheckmarkList;
