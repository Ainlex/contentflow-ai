import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Cliente único para el navegador (Client Components)
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export const createClientSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error(
        'Missing environment variable NEXT_PUBLIC_SUPABASE_URL. Please check your .env.local file.'
      )
    }

    if (!supabaseAnonKey) {
      throw new Error(
        'Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY. Please check your .env.local file.'
      )
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}

// Cliente para el servidor (con service role key si es necesario)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error(
      'Missing environment variable NEXT_PUBLIC_SUPABASE_URL. Please check your .env.local file.'
    )
  }

  if (!supabaseKey) {
    throw new Error(
      'Missing environment variables. Please check your .env.local file.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
} 