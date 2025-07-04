import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/onboarding']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Rutas de autenticación (para usuarios ya autenticados)
  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Solo verificar autenticación en rutas protegidas o de auth
  if (isProtectedRoute || isAuthRoute) {
    try {
      // Refresh session if expired - required for Server Components
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.log('Auth error in middleware:', error)
        // Para rutas protegidas, redirigir a login si hay error de sesión
        if (isProtectedRoute) {
          const redirectUrl = new URL('/auth/login', request.url)
          redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
          return NextResponse.redirect(redirectUrl)
        }
        return supabaseResponse
      }

      // Si es una ruta protegida y no hay usuario, redirigir a login
      if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Si es una ruta de auth y hay usuario, redirigir a dashboard
      if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // Si hay error de sesión, continuar sin autenticación
      console.log('Auth session error in middleware:', error)
      
      // Para rutas protegidas, redirigir a login si hay error de sesión
      if (isProtectedRoute) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 