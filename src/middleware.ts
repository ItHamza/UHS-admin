import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in',
  '/sign-up',
  '/favicon.ico',
  '/_next(.*)',
  '/api(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId } = await auth(); // ✅ Await auth()

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
});

export const config = {
  matcher: ['/((?!_next/|favicon.ico).*)'],
};
