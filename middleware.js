import { NextResponse } from 'next/server'

// Middleware minimal — pas de Supabase SSR pour éviter les erreurs edge runtime
// L'auth est gérée côté client via AuthContext
export function middleware(request) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
