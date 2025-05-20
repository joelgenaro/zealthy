import CallingIcon from '@/components/shared/icons/CallingIcon';
import ForumIcon from '@/components/shared/icons/ForumIcon';
import HospitalIcon from '@/components/shared/icons/HospitalIcon';
import { Link, Stack, Typography } from '@mui/material';

interface SuicideDisclaimerProps {
  showDisclaimer?: boolean;
}

const SuicideDisclaimer = ({
  showDisclaimer = false,
}: SuicideDisclaimerProps) => {
  return (
    <Stack direction="column" gap="48px">
      <Stack direction="column" gap="16px">
        <Stack direction="row" gap="16px">
          <HospitalIcon />
          Visiting a hospital near you
        </Stack>
        <Stack direction="row" gap="16px">
          <CallingIcon />
          <Typography>
            Calling the Suicide & Crisis Lifeline:{' '}
            <Link href="tel:988">988</Link> or chat using this link{' '}
            <Link href="https://988lifeline.org/chat/">
              988 Lifeline Chat and Text
            </Link>
          </Typography>
        </Stack>
        <Stack direction="row" gap="16px">
          <CallingIcon />
          <Typography>
            Calling Emergency Services: <Link href="tel:911">911</Link>
          </Typography>
        </Stack>
        <Stack direction="row" gap="16px">
          <ForumIcon />
          <Typography>
            Texting The Crisis Text Line: <Link href="sms:741741">741741</Link>
          </Typography>
        </Stack>
      </Stack>
      {showDisclaimer ? (
        <Stack direction="column" gap="16px">
          <Typography>
            Antidepressants and other treatments can help with serious
            depression.
          </Typography>
          <Typography>
            You may continue with Zealthy if you choose; however, be aware that
            starting antidepressants can sometimes lead to a short-term increase
            in suicidal thoughts among people who already have them, especially
            for those 24 or younger. It is critical that you stay in close
            communication with your provider and reach out for help if your
            symptoms continue or worsen.
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default SuicideDisclaimer;
