import { Box, Grid, Typography } from '@mui/material';
import StarOutline from '../icons/StarOutline';
import StarFill from '../icons/StarFill';

interface Props {
  description: string;
  value: number;
  onChange: (rating: number) => void;
}

const Star = ({
  index,
  highlighted,
  setRating,
}: {
  index: number;
  highlighted: boolean;
  setRating: Function;
}) => {
  return (
    <Box
      sx={{ cursor: 'pointer', height: '24px', width: '24px' }}
      onClick={() => setRating(index)}
    >
      {highlighted ? <StarFill /> : <StarOutline />}
    </Box>
  );
};

const StarRating = ({ description, value, onChange }: Props) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        index={i + 1}
        highlighted={value > i}
        setRating={onChange}
      />
    );
  }

  return (
    <Grid container direction="column" gap={1}>
      <Typography
        marginBottom={'1rem'}
        fontWeight={600}
        variant="body1"
        textAlign="center"
      >
        {description}
      </Typography>
      <Grid container direction="row" gap={2} justifyContent="center">
        {stars}
      </Grid>
    </Grid>
  );
};

export default StarRating;
