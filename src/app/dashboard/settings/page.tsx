'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  User, 
  Building, 
  Globe, 
  Save,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Link,
  Unlink
} from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
          console.log('Error fetching profile:', profileError)
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        console.log('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router, supabase])

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: profile.company_name,
          website_url: profile.website_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        console.error('Error updating profile:', error)
      } else {
        console.log('Profile updated successfully')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Gestiona tu perfil y configuración de cuenta</p>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <User className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Perfil de Usuario</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Nombre de la Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="company_name"
                  value={profile?.company_name || ''}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="website_url">Sitio Web</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="website_url"
                value={profile?.website_url || ''}
                onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                className="pl-10"
                placeholder="https://miempresa.com"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Social Media Connections */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <Link className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Redes Sociales</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Facebook className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Facebook</p>
                <p className="text-sm text-gray-500">Conecta tu página de Facebook</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              Conectar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Twitter className="h-6 w-6 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Twitter</p>
                <p className="text-sm text-gray-500">Conecta tu cuenta de Twitter</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              Conectar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Instagram className="h-6 w-6 text-pink-600" />
              <div>
                <p className="font-medium text-gray-900">Instagram</p>
                <p className="text-sm text-gray-500">Conecta tu cuenta de Instagram</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              Conectar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Linkedin className="h-6 w-6 text-blue-700" />
              <div>
                <p className="font-medium text-gray-900">LinkedIn</p>
                <p className="text-sm text-gray-500">Conecta tu perfil de LinkedIn</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              Conectar
            </Button>
          </div>
        </div>
      </div>

      {/* Onboarding Reset */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Configuración Avanzada</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Reconfigurar Cuenta</p>
              <p className="text-sm text-gray-500">Volver a ejecutar el proceso de configuración inicial</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/onboarding')}
            >
              Reconfigurar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 