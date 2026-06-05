import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/fr', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
