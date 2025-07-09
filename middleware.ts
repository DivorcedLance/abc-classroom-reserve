import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Solo aplicar middleware a rutas específicas para evitar loops de redirección
  const { pathname } = req.nextUrl
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/reservations', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Rutas de autenticación
  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Permitir todas las demás rutas sin middleware
  if (!isProtectedRoute && !isAuthRoute && pathname !== '/') {
    return NextResponse.next()
  }

  // Para rutas protegidas, redirigir a login (la verificación real se hace en el cliente)
  if (isProtectedRoute) {
    // El middleware no puede verificar la sesión de manera confiable sin el helper
    // Así que solo redirigimos en el cliente con useEffect
    return NextResponse.next()
  }

  // Para la ruta raíz, redirigir a login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public/|debug|auth-test|connection-test).*)',
  ],
}
