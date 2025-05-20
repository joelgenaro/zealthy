import { NextRequest, NextResponse } from 'next/server';
import { restrictMethods } from './middleware/cors/restrictMethods';
import { allowOrigin } from './middleware/cors/allowOrigin';

export function middleware(req: NextRequest): NextResponse {
  let response = restrictMethods()(req);
  if (response.status !== 200) {
    return response;
  }
  response = allowOrigin(req);
  return response;
}
