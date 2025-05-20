import SubHeading from '@/components/shared/SubHeading';
import CustomText from '@/components/shared/Text';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import tips from './tips';

interface TextProps {
  sentence: string;
}

const Text = ({ sentence }: TextProps) => {
  return (
    <>
      {sentence.split(' ').map((word, index) => {
        if (word.startsWith('[')) {
          const link = word.replace('[', '').replace(']', '');
          return <Link key="link" href={`mailto:${link}`}>{`${link} `}</Link>;
        }
        return word + ' ';
      })}
    </>
  );
};

const VisitTips = () => {
  return (
    <Box>
      <SubHeading>Here are some tips for a great visit:</SubHeading>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tips.map((item, index) => (
          <ListItem
            key={item}
            sx={{
              padding: '0',
              gap: '16px',
              alignItems: 'flex-start',
            }}
          >
            <CustomText>{index + 1}.</CustomText>
            <CustomText>
              <Text sentence={item} />
            </CustomText>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default VisitTips;
