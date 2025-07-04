'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { AuthButton } from '@/components/auth/auth-button'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('No user found, redirecting to login')
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Obtener perfil del usuario
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.log('Error fetching profile:', profileError)
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        console.log('Error getting user:', err)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Ya se está redirigiendo
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con AuthButton */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                ContentFlow Dashboard
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Bienvenido a ContentFlow!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Hola {profile?.company_name || user.email}, tu dashboard está listo.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Generar Contenido
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Crea contenido automático para tus redes sociales
                  </p>
                  <Button className="w-full">
                    Comenzar
                  </Button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Conectar Redes
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vincula tus cuentas de redes sociales
                  </p>
                  <Button className="w-full">
                    Conectar
                  </Button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ver Estadísticas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Analiza el rendimiento de tu contenido
                  </p>
                  <Button className="w-full">
                    Ver Stats
                  </Button>
                </div>
              </div>

              {/* Botón para ir al onboarding */}
              <div className="mt-8 text-center">
                <Button
                  onClick={() => router.push('/onboarding')}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                >
                  Configurar Mi Cuenta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 