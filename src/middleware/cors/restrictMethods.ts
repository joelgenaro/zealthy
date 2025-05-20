import { NextRequest, NextResponse } from 'next/server';
import { AllMethods, MiddlewareFunction } from '../types';

const defaultAllowedMethods: AllMethods[] = ['GET', 'POST', 'PUT'];

export const restrictMethods = (): MiddlewareFunction => {
  return (req: NextRequest) => {
    const allowedMethods = defaultAllowedMethods;
    // Handle preflight request
    if (
      req.method === 'OPTIONS' &&
      req.url.includes('api/webflow/patient-data')
    ) {
      return NextResponse.next();
    }

    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 });
      res.headers.set(
        'Access-Control-Allow-Methods',
        allowedMethods.join(', ')
      );
      return res;
    }

    if (!allowedMethods.includes(req.method as AllMethods)) {
      return new NextResponse(`Method ${req.method} Not Allowed`, {
        status: 405,
      });
    }
    return NextResponse.next();
  };
};
