import { QuestionWithName } from '@/types/questionnaire';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Divider } from '@mui/material';
import { usePatient } from '@/components/hooks/data';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useState, useCallback, MouseEvent } from 'react';
import { useAnswerAction } from '@/components/hooks/useAnswer';

interface HonestyPrivacyProps {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

const HonestyPrivacy = ({ question, nextPage }: HonestyPrivacyProps) => {
  const { data: patient } = usePatient();
  const [isChecked, setIsChecked] = useState(false);
  const { submitSingleSelectAnswer } = useAnswerAction(question);

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submitSingleSelectAnswer({
      text: 'true',
      code: 'PREP_Q1_A1',
    });
    nextPage();
  }, []);

  return (
    <Stack gap={3}>
      <Typography>
        To ensure the medication we prescribe is safe for you, next please
        answer a few questions from our medical team.
      </Typography>
      <Typography>
        Your answers will be kept confidential, and only used to make sure we
        provide the right care for you.
      </Typography>
      <Typography>
        This telehealth session is not a replacement for a primary care
        relationship or annual physical wellness exam. We encourage you to see
        your health provider at least once a year.
      </Typography>
      <Typography>
        By starting a consultation, you consent to our{' '}
        <span
          style={{
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          onClick={() =>
            window.open(
              'https://www.getzealthy.com/consent-to-telehealth',
              '_blank',
              'noopener,noreferrer'
            )
          }
        >
          Telehealth Consent Policy
        </span>{' '}
        &{' '}
        <span
          style={{
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          onClick={() =>
            window.open(
              'https://www.getzealthy.com/privacy-policy',
              '_blank',
              'noopener,noreferrer'
            )
          }
        >
          Notice of Privacy Practices
        </span>
        .
      </Typography>
      <Typography>
        Meet the Zealthy medical providers licensed in your state; one or more
        of these medical providers will be treating you.
      </Typography>
      <Divider sx={{ borderColor: 'gray' }} />
      <Typography
        sx={{ fontWeight: 'bold' }}
      >{`Email: ${patient?.profiles.email}`}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ marginRight: 2 }}>
          <Checkbox
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
        </Box>
        <Typography variant="body2">
          I consent to Zealthy sending me Email and Text (SMS) messages that
          contain my protected health information (PHI) to keep me informed
          about my health consultation, prescriptions, & medications I receive
          through Zealthy.
          <br />
          <br />
          If I unclick this box, I understand that Zealthy may still send me
          Email and Text (SMS) alerts, but the message will not contain any PHI
          other than my name.
          <br />
          <br />
          Please be advised that emails & texts we send you are not secure
          because they are unencrypted. Other people may be able to read these
          emails and texts. I consent to telehealth.
        </Typography>
      </Box>
      <Button
        fullWidth
        disabled={!isChecked}
        onClick={handleClick}
      >{`Continue`}</Button>
    </Stack>
  );
};

export default HonestyPrivacy;
