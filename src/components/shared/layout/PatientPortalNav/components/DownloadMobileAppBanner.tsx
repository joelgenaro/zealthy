import { useEffect, MouseEvent } from 'react';
import AppIcon from '@/components/shared/AppIcon/AppIcon';
import SmartBannerText from './SmartBannerText';

// App store URLs
const APP_STORE_URL = 'https://link.getzealthy.com/FEbcTpIshSb';
const PLAY_STORE_URL = 'https://link.getzealthy.com/FEbcTpIshSb';

const IOS_DEEP_LINK = 'com.getzealthy://';
const ANDROID_DEEP_LINK = 'com.getzealthy://';

const ios = {
  header: 'Zealthy Health & Weight Loss',
  subheader: 'Get prescriptions & medications',
  CTA: 'GET -- On the App Store',
  button: ['Open', 'View'],
  link: APP_STORE_URL,
  deepLink: IOS_DEEP_LINK,
};

const android = {
  header: 'Zealthy Health & Weight Loss',
  subheader: 'Get prescriptions & medications',
  CTA: 'GET - On the Google Play Store',
  button: ['Open', 'View'],
  link: PLAY_STORE_URL,
  deepLink: ANDROID_DEEP_LINK,
};

const createAppLink = (linkUrl: string, fallbackUrl: string) => {
  // For iOS devices
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // Use a two-step approach for better UX

    // First, try to open the app directly
    window.location.href = linkUrl;

    // Track if we've shown the permission dialog
    let hasInteracted = false;

    // Listen for user interaction events that indicate they've responded to the prompt
    const interactionEvents = ['touchstart', 'touchend', 'click'];
    const handleInteraction = () => {
      hasInteracted = true;
      // Remove all event listeners once we detect interaction
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    // Add event listeners for user interactions
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction);
    });

    // Set a reasonable timeout that gives users time to respond
    setTimeout(() => {
      // Only redirect to App Store if the user has interacted
      // This suggests they responded to the prompt but the app didn't open
      if (hasInteracted) {
        window.location.replace(fallbackUrl);
      }

      // Clean up event listeners
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    }, 5000); //

    return;
  }

  // For Android devices
  else if (/Android/.test(navigator.userAgent)) {
    // Use intent URL format for Android
    const intentUrl = `intent://${linkUrl.replace(
      '://',
      '/'
    )}#Intent;scheme=zealthy;package=com.zealthy.mobileapp;end`;
    window.location.href = intentUrl;

    // Fallback to Play Store
    setTimeout(() => {
      window.location.href = fallbackUrl;
    }, 5000);
    return;
  }

  // Fallback for other devices
  window.location.href = fallbackUrl;
};

const hideBannerForSession = () => {
  try {
    sessionStorage.setItem('appBannerHidden', 'true');
  } catch (e) {
    console.error('Error setting session storage', e);
  }
};

const isBannerHiddenInSession = () => {
  try {
    return sessionStorage.getItem('appBannerHidden') === 'true';
  } catch (e) {
    console.error('Error reading from session storage', e);
    return false;
  }
};

const HasAppBanner = ({
  showBanner,
  setShowBanner,
  os,
}: {
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
  os: string;
}) => {
  const appInfo = os === 'iOS' ? ios : android;

  const handleCloseBanner = () => {
    setShowBanner(false);
    hideBannerForSession();
  };

  const handleOpenApp = (e: MouseEvent) => {
    e.preventDefault();
    window.location.href = appInfo.link;
    handleCloseBanner();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100px',
        backgroundColor: '#f2f1f6',
        display: showBanner ? 'flex' : 'none',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      <div
        style={{
          minWidth: '325px',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '5px',
        }}
      >
        <button
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            padding: '0 5px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'grey',
          }}
          onClick={handleCloseBanner}
        >
          X
        </button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '5px',
            alignItems: 'center',
          }}
        >
          <AppIcon width={60} height={60} link="/icons/ZealthyIcon.webp" />
          <SmartBannerText appInfo={appInfo} />
        </div>

        <button
          style={{
            background: 'none',
            color: '#7b95ea',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
          onClick={handleOpenApp}
        >
          {appInfo.button[0]}
        </button>
      </div>
    </div>
  );
};

const DoesNotHaveApp = ({
  showBanner,
  setShowBanner,
  os,
}: {
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
  os: string;
}) => {
  const appInfo = os === 'iOS' ? ios : android;

  const handleCloseBanner = () => {
    setShowBanner(false);
    hideBannerForSession();
  };

  const handleGetApp = (e: MouseEvent) => {
    e.preventDefault();
    window.location.href = appInfo.link;
    handleCloseBanner();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100px',
        backgroundColor: '#f2f1f6',
        display: showBanner ? 'flex' : 'none',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      <div
        style={{
          minWidth: '325px',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '5px',
        }}
      >
        <button
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            padding: '0 5px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'lightgrey',
          }}
          onClick={handleCloseBanner}
        >
          X
        </button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '5px',
            alignItems: 'center',
          }}
        >
          <AppIcon width={60} height={60} link="/icons/ZealthyIcon.webp" />
          <SmartBannerText appInfo={appInfo} />
        </div>
        <button
          style={{
            background: 'none',
            color: '#7b95ea',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
          onClick={handleGetApp}
        >
          {appInfo.button[1]}
        </button>
      </div>
    </div>
  );
};

const DownloadMobileAppBanner = ({
  showBanner,
  setShowBanner,
  hasApp,
  os,
}: {
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
  hasApp: boolean;
  os: string;
}) => {
  // Detect OS if not provided
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldHideBanner = isBannerHiddenInSession();
      if (shouldHideBanner) {
        setShowBanner(false);
      }
    }
  }, [os, setShowBanner]);

  if (isBannerHiddenInSession()) {
    return null;
  }

  // Skip rendering for non-mobile devices
  if (!['iOS', 'Android'].includes(os)) {
    return null;
  }

  return hasApp ? (
    <HasAppBanner
      showBanner={showBanner}
      setShowBanner={setShowBanner}
      os={os}
    />
  ) : (
    <DoesNotHaveApp
      showBanner={showBanner}
      setShowBanner={setShowBanner}
      os={os}
    />
  );
};

export default DownloadMobileAppBanner;
