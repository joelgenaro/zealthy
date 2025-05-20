import {
  Button,
  List,
  ListItemButton,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CheckMark from '@/components/shared/icons/CheckMark';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import {
  useLanguage,
  usePatient,
  useVWOVariationName,
} from '@/components/hooks/data';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

const StyledForm = styled('form')`
  width: 100%;
`;

const items = [
  'Facebook or Instagram',
  'Google',
  'TikTok',
  'YouTube',
  'Another website',
  'Radio Ad',
  'Podcast Ad',
  'TV Ad',
  'Streaming Ad (eg. Hulu, Netflix, Roku)',
  'Bing',
  'Reddit',
  'Someone told me about it',
  'News - TV or Newspaper',
];
const itemsSpanish = [
  'Facebook o Instagram',
  'Google',
  'TikTok',
  'YouTube',
  'Otro sitio web',
  'Anuncio de radio',
  'Anuncio de podcast',
  'Anuncio de TV',
  'Anuncio de streaming (ej. Hulu, Netflix, Roku)',
  'Bing',
  'Reddit',
  'Alguien me lo contó',
  'Noticias - TV o periódico',
];

const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

interface MarketingQuestionProps {
  onContinue: () => void;
}

const MarketingQuestion = ({ onContinue }: MarketingQuestionProps) => {
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const [userSelection, setUserSelection] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const language = useLanguage();
  const { data: variation5867 } = useVWOVariationName('5867');

  useEffect(() => {
    if (!options.length && language === 'esp') {
      const shuffled = shuffle(itemsSpanish);
      setOptions(shuffled);
    } else if (!options.length) {
      const shuffled = shuffle(items);
      setOptions(shuffled);
    }
  }, [options]);

  const handleSubmit = async (selection: string) => {
    setLoading(true);

    window?.freshpaint?.identify(patient?.profiles.id, {
      marketing_referral: selection,
    });

    if (patient?.profile_id) {
      await supabase
        .from('profiles')
        .update({ referral_source: [selection] })
        .eq('id', patient?.profile_id);
    }

    setLoading(false);

    if (variation5867?.variation_name === 'Variation-2') {
      Router.push(Pathnames.WHATS_NEXT_5867);
    } else {
      onContinue();
    }
  };

  const handleOptionSelect = (option: string) => {
    setUserSelection(option);
    handleSubmit(option);
  };

  let titleText = 'How did you hear about us?';
  let subtitleText = 'Select all that apply:';
  let continueButtonText = 'Continue';
  let skipButtonText = 'Skip';

  if (language === 'esp') {
    titleText = '¿Cómo se enteró de nosotros?';
    subtitleText = 'Seleccione todas las opciones que correspondan:';
    continueButtonText = 'Continuar';
    skipButtonText = 'Omitir';
  }

  const handleOnContinue = async () => {
    if (variation5867?.variation_name === 'Variation-2') {
      Router.push(Pathnames.WHATS_NEXT_5867);
    } else {
      onContinue();
    }
  };

  return (
    <StyledForm onSubmit={e => e.preventDefault()}>
      <Stack gap="16px" marginBottom="30px">
        <Typography variant="h2">{titleText}</Typography>
        <Typography variant="body1">{subtitleText}</Typography>
      </Stack>
      <List
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '30px',
          padding: '0',
        }}
      >
        {options.map(option => {
          const isSelected = userSelection === option;

          return (
            <ListItemButton
              sx={{ padding: '12px 25px !important' }}
              selected={isSelected}
              key={option}
              onClick={() => handleOptionSelect(option)}
              disabled={loading}
            >
              {option}
              {isSelected ? <CheckMark style={{ marginLeft: 'auto' }} /> : null}
            </ListItemButton>
          );
        })}
      </List>

      <LoadingButton
        type="submit"
        loading={loading}
        sx={{ width: '100%', marginBottom: '1rem' }}
      >
        {continueButtonText}
      </LoadingButton>
      <Button color="grey" fullWidth onClick={() => handleOnContinue()}>
        {skipButtonText}
      </Button>
    </StyledForm>
  );
};

export default MarketingQuestion;
