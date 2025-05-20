import NumberedList from '@/components/shared/NumberedList';
import Title from '@/components/shared/Title';
import { ListItem } from '@/types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ReactNode, memo } from 'react';

interface Props {
  title: string;
  body: string;
  listItems?: ListItem[];
  buttonText?: string;
  buttonAction?: () => void;
  captionText?: string;
  children?: ReactNode;
  numberedList?: boolean;
}

const VisitMessage = memo(
  ({
    title,
    body,
    listItems,
    captionText,
    children,
    numberedList = true,
  }: Props) => {
    return (
      <Grid
        container
        direction="column"
        gap="20px"
        component="section"
        sx={{ minHeight: '200px' }}
      >
        <Grid container direction="column" gap="16px">
          {captionText && (
            <Typography variant="caption" color="#777777" component="span">
              {captionText}
            </Typography>
          )}
          <Title text={title} />
          <Typography variant="body2" component="p">
            {body}
          </Typography>
        </Grid>
        {listItems && (
          <>
            {numberedList ? (
              <NumberedList items={listItems} />
            ) : (
              <ul style={{ padding: '0 20px', margin: 0 }}>
                {listItems.map((item, index) => (
                  <li
                    style={{ marginBottom: '1rem' }}
                    key={item.title || index}
                  >
                    <Typography>{item.title}</Typography>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {children}
      </Grid>
    );
  }
);

VisitMessage.displayName = 'VisitMessage';

export default VisitMessage;
