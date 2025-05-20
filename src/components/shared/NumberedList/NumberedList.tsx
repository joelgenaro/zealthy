import { ListItem } from '@/types';
import { Box, Grid, Typography } from '@mui/material';

interface Props {
  items: ListItem[];
}

const NumberedList = ({ items }: Props) => {
  return (
    <Grid container direction="column" gap="24px">
      {items.map((item, index) => (
        <Box
          key={index}
          gap="16px"
          display="grid"
          gridTemplateColumns="28px 1fr"
        >
          <Typography variant="h6">{index + 1}.</Typography>
          <Grid item direction="column" gap="8px">
            <Typography variant="h6">{item.title}</Typography>
            <Typography variant="body1">{item.body}</Typography>
          </Grid>
        </Box>
      ))}
      <Typography variant="body1" textAlign="center"></Typography>
    </Grid>
  );
};

export default NumberedList;
