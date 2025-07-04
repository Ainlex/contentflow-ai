import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Cliente para Server Components
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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
}

// Helper para obtener el usuario actual
export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('Auth error in getCurrentUser:', error)
      return null
    }

    return user
  } catch (error) {
    console.log('Unexpected error in getCurrentUser:', error)
    return null
  }
}

// Helper para obtener el perfil del usuario
export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createServerSupabaseClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return profile
}

// Helper para obtener perfil por ID de usuario
export async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile
}

// Helper para crear/actualizar perfil
export async function upsertProfile(profileData: {
  id: string
  email: string
  company_name?: string
  industry?: string
  brand_voice?: string
}) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, {
      onConflict: 'id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting profile:', error)
    throw error
  }

  return data
}

// Helper para obtener la suscripción del usuario
export async function getUserSubscription() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createServerSupabaseClient()
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', error)
    return null
  }

  return subscription
}

// Helper para obtener el uso del usuario
export async function getUserUsage(monthYear?: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const currentMonth = monthYear || new Date().toISOString().slice(0, 7) // '2024-01' format

  const supabase = await createServerSupabaseClient()
  const { data: usage, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('month_year', currentMonth)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching usage:', error)
    return null
  }

  return usage
} 