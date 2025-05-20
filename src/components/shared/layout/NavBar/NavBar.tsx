import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { Grid, Link, Stack, useMediaQuery, useTheme } from '@mui/material';
import RoundButton from '@/components/shared/Button/RoundButton';
import { Pathnames } from '@/types/pathnames';
import Logo from '@/components/shared/icons/Logo';
import ProgressBarV2 from '../../ProgressBarV2';

const NavBar = () => {
  const Router = useRouter();
  const user = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { pathname, query } = Router;

  const isVariation6819 = query.variant === '6819';
  const isSignUpFlow = ['/signup'].includes(pathname);

  function onSignOut() {
    Router.push(Pathnames.LOG_OUT);
  }

  return (
    <Grid
      container
      px={isMobile ? 2 : 6.5}
      height={isMobile ? 60 : 108}
      bgcolor={
        !isMobile
          ? theme.palette.background.paper
          : theme.palette.background.default
      }
      borderBottom={!isMobile ? '1px solid #777777' : 'none'}
      justifyContent={!isMobile ? 'space-between' : 'center'}
      alignItems="center"
    >
      {!isVariation6819 || (isVariation6819 && !isMobile) ? (
        <Link href="/" style={{ color: 'inherit' }}>
          <Logo />
        </Link>
      ) : null}

      {isVariation6819 && isSignUpFlow && (
        <ProgressBarV2 answers={[]} specificProgress={0} />
      )}

      {!isMobile && (
        <Stack spacing={2} direction="row">
          {user ? (
            // TODO: clear localStorage on sign out
            <RoundButton variant="text" onClick={onSignOut}>
              Sign out
            </RoundButton>
          ) : (
            <>
              {pathname !== '/login' && (
                <Link component={NextLink} href={Pathnames.LOG_IN}>
                  <RoundButton variant="text" size="small">
                    Log in
                  </RoundButton>
                </Link>
              )}
              {pathname !== '/signup' && (
                <Link component={NextLink} href={Pathnames.SIGN_UP}>
                  <RoundButton sx={{ color: 'white' }} size="small">
                    Sign up
                  </RoundButton>
                </Link>
              )}
            </>
          )}
        </Stack>
      )}
    </Grid>
  );
};

export default NavBar;
