import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const token = searchParams.get('token') // Para enlaces de confirmación antiguos
  const type = searchParams.get('type') // Para identificar el tipo de confirmación

  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    token: token ? 'present' : 'missing',
    type,
    next,
    error,
    errorDescription,
    url: request.url,
    allParams: Object.fromEntries(searchParams.entries())
  })

  // Si hay un error en los parámetros, redirigir a la página de error
  if (error) {
    console.error('Auth error in callback:', { error, errorDescription })
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`
    )
  }

  // Intentar con code primero (nuevo formato)
  if (code) {
    return await handleCodeExchange(code, next, origin)
  }

  // Intentar con token (formato antiguo)
  if (token) {
    console.log('Using token for confirmation')
    return await handleTokenConfirmation(token, next, origin)
  }

  // Si es una confirmación de email sin parámetros específicos
  if (type === 'signup' || type === 'recovery') {
    console.log('Email confirmation without code/token, redirecting to login')
    return NextResponse.redirect(`${origin}/auth/login?message=email_confirmed`)
  }

  // No code or token provided
  console.error('No authentication code or token provided in callback')
  console.log('Available parameters:', Object.fromEntries(searchParams.entries()))
  return NextResponse.redirect(
    `${origin}/auth/auth-code-error?error=${encodeURIComponent('No authentication code provided')}`
  )
}

async function handleCodeExchange(code: string, next: string, origin: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    if (data.session) {
      console.log('Session created successfully')
      
      // Verificar si es un usuario nuevo o existente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.session.user.id)
        .single()

      if (profileError || !profile) {
        // Usuario nuevo - ir al onboarding
        console.log('New user, redirecting to onboarding')
        return NextResponse.redirect(`${origin}/onboarding`)
      } else if (!profile.onboarding_completed) {
        // Usuario existente sin onboarding completo - ir al onboarding
        console.log('User without completed onboarding, redirecting to onboarding')
        return NextResponse.redirect(`${origin}/onboarding`)
      } else {
        // Usuario existente con onboarding completo - ir al dashboard
        console.log('User with completed onboarding, redirecting to dashboard')
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    } else {
      console.error('No session created after code exchange')
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent('No session created')}`
      )
    }
  } catch (err) {
    console.error('Unexpected error in callback:', err)
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent('Unexpected error occurred')}`
    )
  }
}

async function handleTokenConfirmation(token: string, next: string, origin: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  try {
    // Intentar confirmar el email con el token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    })

    if (error) {
      console.error('Error verifying token:', error)
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
      )
    }

    if (data.user) {
      console.log('Email confirmed successfully, redirecting to:', next)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('No user found after token verification')
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent('No user found after verification')}`
      )
    }
  } catch (err) {
    console.error('Unexpected error in token confirmation:', err)
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent('Unexpected error occurred')}`
    )
  }
} 