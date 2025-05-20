import { useLanguage } from '@/components/hooks/data';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

interface ListItemsProps {
  dosage: string;
  isOral: boolean;
}

const ListItems = ({ dosage, isOral }: ListItemsProps) => {
  const language = useLanguage();
  const items = useMemo(() => {
    if (isOral) {
      return [
        dosage,
        language === 'esp'
          ? 'Apoyo constante de su equipo de atención para asegurar que está logrando sus objetivos de pérdida de peso'
          : "Consistent support from your care team to ensure you're achieving your weight loss goals",
      ];
    }
    return [
      dosage,
      language === 'esp' ? 'Agujas de inyección' : 'Injection needles',
      language === 'esp' ? 'Almohadillas con alcohol' : 'Alcohol pads',
      language === 'esp'
        ? 'Folleto de instrucciones de inyección (el video estará en su página de inicio de Zealthy)'
        : 'Injection instructions pamphlet (video will be in your Zealthy home page)',
      language === 'esp'
        ? 'Apoyo constante de su equipo de atención para asegurar que está logrando sus objetivos de pérdida de peso'
        : "Consistent support from your care team to ensure you're achieving your weight loss goals",
    ];
  }, [dosage, isOral, language]);

  let whatsIncluded = "What's included:";
  if (language === 'esp') {
    whatsIncluded = 'Qué está incluido:';
  }

  return (
    <>
      <Typography variant="body1" fontSize="0.75rem !important">
        {whatsIncluded}
      </Typography>
      <List
        sx={{
          listStyleType: 'disc',
          pl: 3,
          marginBottom: '8px',
        }}
      >
        {items.map(item => (
          <ListItem
            key={item}
            sx={{
              fontSize: '0.75rem !important',
              display: 'list-item',
              padding: 0,
            }}
          >
            {item}
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default ListItems;
