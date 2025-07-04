'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Loader2, LogIn, LogOut, User } from 'lucide-react'

export function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // Obtener usuario actual
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.log('No user session - this is normal for public pages:', error.message)
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (err) {
        console.log('No user session - this is normal for public pages')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      } else {
        console.log('Successfully signed out')
        setUser(null)
        
        // Usar window.location para asegurar que funcione en todas las páginas
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error)
      // Intentar redirección de todas formas
      window.location.href = '/'
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleProfile = () => {
    router.push('/dashboard/profile')
  }

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleProfile}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          {user.email?.split('@')[0] || 'Perfil'}
        </Button>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Cerrar Sesión
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleLogin}
      className="flex items-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      Iniciar Sesión
    </Button>
  )
} 