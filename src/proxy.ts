import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const xff = request.headers.get('x-forwarded-for');
  const ip = xff?.split(',')[0]?.trim() || 'unknown';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Audit-Request-IP', ip);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/audit/start'],
};
