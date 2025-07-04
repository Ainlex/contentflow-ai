'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { AuthButton } from '@/components/auth/auth-button'

export default function OnboardingPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando onboarding...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Ya se está redirigiendo
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header con AuthButton */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                ContentFlow Onboarding
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a ContentFlow!
          </h1>
          <p className="text-xl text-gray-600">
            Vamos a configurar tu cuenta para que puedas comenzar a crear contenido increíble
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            {/* Paso 1: Información de la empresa */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Paso 1: Información de tu Empresa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    defaultValue={profile?.company_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tu empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industria
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Selecciona una industria</option>
                    <option value="tech">Tecnología</option>
                    <option value="healthcare">Salud</option>
                    <option value="finance">Finanzas</option>
                    <option value="education">Educación</option>
                    <option value="retail">Comercio Minorista</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Paso 2: Voz de marca */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Paso 2: Voz de tu Marca
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cómo describirías la voz de tu marca?
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Profesional pero amigable, enfocado en soluciones prácticas..."
                />
              </div>
            </div>

            {/* Paso 3: Redes sociales */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Paso 3: Conectar Redes Sociales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <span className="text-blue-600 font-medium">Facebook</span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <span className="text-blue-400 font-medium">Twitter</span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <span className="text-pink-600 font-medium">Instagram</span>
                </button>
              </div>
            </div>

            {/* Paso 4: Plan de suscripción */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Paso 4: Tu Plan de Prueba
              </h2>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                  Plan de Prueba Gratuita
                </h3>
                <ul className="text-indigo-800 space-y-2">
                  <li>• 14 días de acceso completo</li>
                  <li>• Generación ilimitada de contenido</li>
                  <li>• Conexión a 3 redes sociales</li>
                  <li>• Soporte por email</li>
                </ul>
                <p className="text-sm text-indigo-600 mt-4">
                  No se requiere tarjeta de crédito. Puedes cancelar en cualquier momento.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline">
              Saltar por ahora
            </Button>
            <Button>
              Completar Configuración
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 