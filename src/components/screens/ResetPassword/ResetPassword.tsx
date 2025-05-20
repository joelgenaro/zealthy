import LoadingButton from '@/components/shared/Button/LoadingButton';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Database } from '@/lib/database.types';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';
import ResetPasswordSent from './ResetPasswordSent';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');
  const supabase = useSupabaseClient<Database>();
  const [error, setError] = useState('');

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(e => {
    setEmail(e.target.value);
    setError('');
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();

      const redirectTo =
        window.location.protocol +
        '//' +
        window.location.host +
        '/update-password';

      setLoading(true);
      setError('');
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo,
        }
      );

      if (!error) {
        setIsSent(true);
      } else {
        setError(error.message);
      }

      setLoading(false);
    },
    [email, supabase.auth]
  );

  if (isSent) {
    return <ResetPasswordSent />;
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} gap="16px">
      <Typography variant="h2">Forgot password?</Typography>
      <Typography paragraph>
        Enter your email below and we will send you a link to reset your
        password
      </Typography>
      <FormControl variant="filled" fullWidth required>
        <InputLabel htmlFor="filled-adornment-email">Email address</InputLabel>
        <FilledInput
          fullWidth
          value={email}
          onChange={handleChange}
          disableUnderline={true}
          autoComplete="username"
          id="filled-adornment-email"
          required
        />
      </FormControl>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <LoadingButton type="submit" loading={loading}>
        Reset password
      </LoadingButton>
    </Stack>
  );
};

export default ResetPassword;
