import { NextRequest, NextResponse } from 'next/server';

export function allowOrigin(req: NextRequest): NextResponse {
  const response = NextResponse.next();
  const origin = req?.headers?.get('Origin');
  const path = req.nextUrl.pathname;

  if (
    req.method === 'OPTIONS' &&
    req.url.includes('api/webflow/patient-data')
  ) {
    console.log('WEBFLOW PATIENT DATA MIDDLEWARE');
    return NextResponse.next();
  }

  // Default allowed origins
  const allowedOrigins = ['https://app.getzealthy.com'];

  // Special case for try.getzealthy.com
  if (
    origin === 'https://try.getzealthy.com' &&
    path === '/api/st/get-config'
  ) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    return response;
  }

  // Set default Access-Control-Allow-Origin
  response.headers.set(
    'Access-Control-Allow-Origin',
    allowedOrigins.join(', ')
  );

  if (!origin) {
    return response;
  }

  const allowedPreviewOrigin =
    /^https:\/\/clinician-portal(-[^.]+)?-zealthy\.vercel\.app$/;

  const shouldSetOrigin =
    (process.env.VERCEL_ENV === 'development' &&
      origin === 'http://localhost:4000') ||
    (process.env.VERCEL_ENV === 'preview' &&
      allowedPreviewOrigin.test(origin)) ||
    (process.env.VERCEL_ENV === 'production' &&
      origin === 'https://clinician-portal.getzealthy.com');

  if (shouldSetOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  return response;
}
