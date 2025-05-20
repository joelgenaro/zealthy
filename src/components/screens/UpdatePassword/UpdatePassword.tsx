import LoadingButton from '@/components/shared/Button/LoadingButton';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { validatePassword } from '@/utils/validatePassword';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';

const UpdatePassword = () => {
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topError, setTopError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const hash = (window && window.location?.hash) || '';
    const params = new URLSearchParams(hash.substring(1));

    if (params.has('error_description')) {
      setTopError(params.get('error_description')!);
    }
  }, []);

  const handleClickShowNewPassword = useCallback(
    () => setShowNewPassword(show => !show),
    []
  );
  const handleClickShowConfirmedPassword = useCallback(
    () => setShowConfirmPassword(show => !show),
    []
  );

  const handleMouseDownPassword = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    },
    []
  );

  const handleNewPassword: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setNewPassword(e.target.value);
      setError('');
    },
    []
  );
  const handleConfirmPassword: ChangeEventHandler<HTMLInputElement> =
    useCallback(e => {
      setConfirmPassword(e.target.value);
      setError('');
    }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!user) {
        setError('Unauthorized');
        return;
      }
      if (newPassword.length < 8) {
        return setError('Password should be at least 8 characters');
      }
      if (!validatePassword(newPassword)) {
        return setError(
          'Your password must be at least 8 characters long, contain at least one number, a special character, and have a mixture of uppercase and lowercase letters.'
        );
      }

      await supabase.auth.updateUser({ password: newPassword }).then(() => {
        Router.push(Pathnames.AUTH_TRANSITION);
        setLoading(false);
      });
    },
    [confirmPassword, newPassword, supabase.auth, user, validatePassword]
  );

  return (
    <Stack component="form" onSubmit={handleSubmit} gap="30px">
      {topError ? <ErrorMessage>{topError}</ErrorMessage> : null}
      <Typography variant="h2">Please enter new password</Typography>
      <Stack gap="16px">
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="filled-adornment-password">
            New Password
          </InputLabel>
          <FilledInput
            value={newPassword}
            disableUnderline={true}
            autoComplete="current-password"
            onChange={handleNewPassword}
            id="filled-adornment-password"
            type={showNewPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowNewPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{
                    marginRight: 0,
                  }}
                >
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="filled-adornment-password">
            Confirm Password
          </InputLabel>
          <FilledInput
            value={confirmPassword}
            disableUnderline={true}
            autoComplete="current-password"
            onChange={handleConfirmPassword}
            id="filled-adornment-password"
            type={showConfirmPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowConfirmedPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{
                    marginRight: 0,
                  }}
                >
                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <LoadingButton disabled={!!topError} type="submit" loading={loading}>
          Update
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default UpdatePassword;
