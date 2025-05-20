const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const contentSecurityPolicy = {
  key: 'Permissions-Policy',
  value: [
    'autoplay=*',
    'camera=*',
    'clipboard-read=*',
    'clipboard-write=*',
    'display-capture=*',
    'encrypted-media=*',
    'fullscreen=*',
    'geolocation=*',
    'gyroscope=*',
    'magnetometer=*',
    'microphone=*',
    'midi=*',
    'payment=*',
    'picture-in-picture=*',
    'publickey-credentials-get=*',
    'screen-wake-lock=*',
    'sync-xhr=*',
    'usb=*',
    'xr-spatial-tracking=*',
  ].join(', '),
};

/** @type {import('next').NextConfig} */

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.getzealthy.com',
      },
      {
        protocol: 'https',
        hostname: `${process.env.SUPABASE_PROJECT_REF}.supabase.co`,
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      ...(process.env.VERCEL_ENV === 'production'
        ? []
        : [
            {
              protocol: 'https',
              hostname: `${process.env.SUPABASE_PROJECT_REF_PROD}.supabase.co`,
            },
          ]),
    ],
  },
  output: 'standalone',
  webpack: (config, { dev }) => {
    config.mode = dev ? 'development' : 'production';
    config.module.rules.push({
      test: /\.pdf/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext]',
      },
    });

    return config;
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      contentSecurityPolicy,
    ];
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    webpackBuildWorker: true,
    forceSwcTransforms: true,
  },
  async redirects() {
    return [
      {
        source: '/onboarding',
        destination: '/onboarding/region-screen',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/patient-portal/profile',
        permanent: true,
      },
      {
        source: '/update-payment',
        destination: '/patient-portal/profile/update-payment',
        permanent: true,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig);

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'zealthy-inc',
  project: 'frontend-next',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: false,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  sourcemaps: {
    disable: process.env.VERCEL_PROJECT !== 'frontend-next',
  },
});
