import { NextRequest, NextResponse } from 'next/server';
export type MiddlewareFunction = (req: NextRequest) => NextResponse;
export type AllMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
