'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'

export function useAuthRedirect() {
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth redirect hook - event:', event, 'user:', session?.user?.email)
        
        // Solo manejar SIGNED_OUT, los redirects específicos se manejan en los componentes
        if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])
} 