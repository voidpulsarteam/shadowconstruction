import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userCookie = request.cookies.get('user')

  let user = null
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value)
    } catch {}
  }

  if (pathname.startsWith('/dashboard') && (!user || user.role !== 'admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/fleet' && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add user to headers for server components
  if (user) {
    request.headers.set('x-user', JSON.stringify(user))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/fleet']
}