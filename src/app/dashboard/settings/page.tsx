'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Building, Volume2, Bell, Settings } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/auth'
import { Database } from '@/lib/database.types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ToastProvider } from '@/components/ui/toast'
import { ProfileTab } from '@/components/settings/profile-tab'
import { CompanyTab } from '@/components/settings/company-tab'
import { BrandVoiceTab } from '@/components/settings/brand-voice-tab'
import { NotificationsTab } from '@/components/settings/notifications-tab'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth/login')
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router, supabase])

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="h-8 w-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          </div>
          <p className="text-gray-600">
            Gestiona tu perfil, información de empresa, voz de marca y notificaciones
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="brand-voice" className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <span>Voz de Marca</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                Información Personal
              </h2>
              <p className="text-blue-700">
                Gestiona tu información personal, foto de perfil y configuración de seguridad
              </p>
            </div>
            <ProfileTab profile={profile} onProfileUpdate={handleProfileUpdate} />
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                Información de Empresa
              </h2>
              <p className="text-green-700">
                Configura los datos de tu empresa, industria y objetivos de negocio
              </p>
            </div>
            <CompanyTab profile={profile} onProfileUpdate={handleProfileUpdate} />
          </TabsContent>

          <TabsContent value="brand-voice" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h2 className="text-xl font-semibold text-purple-900 mb-2">
                Voz de Marca
              </h2>
              <p className="text-purple-700">
                Define el tono y personalidad de tu marca para generar contenido consistente
              </p>
            </div>
            <BrandVoiceTab profile={profile} onProfileUpdate={handleProfileUpdate} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
              <h2 className="text-xl font-semibold text-orange-900 mb-2">
                Preferencias de Notificaciones
              </h2>
              <p className="text-orange-700">
                Configura cómo y cuándo quieres recibir notificaciones
              </p>
            </div>
            <NotificationsTab profile={profile} onProfileUpdate={handleProfileUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </ToastProvider>
  )
} 