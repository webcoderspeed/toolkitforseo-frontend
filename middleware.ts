import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/tools(.*)',
  '/dashboard(.*)',
  '/api(.*)'
])

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/contact',
  '/privacy',
  '/cookies',
  '/api/auth/create-user',
  '/api/webhooks/clerk',
  '/api/stripe/webhooks'
])

const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && isProtectedRoute(req)) {
    await auth.protect()
  }

  // For dashboard routes, ensure user setup is triggered
  if (isDashboardRoute(req)) {
    const { userId } = await auth()
    if (userId) {
      // Add a header to indicate user setup should be triggered
      const response = NextResponse.next()
      response.headers.set('x-trigger-user-setup', 'true')
      return response
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}