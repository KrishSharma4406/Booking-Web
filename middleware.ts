import { NextRequest, NextResponse } from 'next/server';

// This middleware runs on every request
// Add your middleware logic here

export function middleware(request: NextRequest) {
  // Example: Log request
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`);

  // Example: Add custom headers
  const response = NextResponse.next();
  response.headers.set('X-Custom-Header', 'value');

  return response;
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
