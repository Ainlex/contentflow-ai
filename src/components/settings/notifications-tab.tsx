'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Smartphone, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { createClientSupabaseClient } from '@/lib/auth'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface NotificationPreferences {
  email_notifications: {
    trial_expiration: boolean
    usage_limits: boolean
    feature_updates: boolean
    marketing_emails: boolean
    weekly_summary: boolean
    content_tips: boolean
  }
  push_notifications: {
    enabled: boolean
    content_published: boolean
    engagement_alerts: boolean
    system_updates: boolean
  }
}

interface NotificationsTabProps {
  profile: Profile | null
  onProfileUpdate: (profile: Profile) => void
}

export function NotificationsTab({ profile, onProfileUpdate }: NotificationsTabProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: {
      trial_expiration: true,
      usage_limits: true,
      feature_updates: true,
      marketing_emails: false,
      weekly_summary: true,
      content_tips: true
    },
    push_notifications: {
      enabled: false,
      content_published: false,
      engagement_alerts: false,
      system_updates: true
    }
  })
  const [isSaving, setSaving] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  
  const { showToast } = useToast()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true)
    }

    // Load preferences if available
    if (profile?.social_accounts) {
      try {
        const savedPreferences = profile.social_accounts as any
        if (savedPreferences.notification_preferences) {
          setPreferences(savedPreferences.notification_preferences)
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error)
      }
    }
  }, [profile])

  const handleEmailNotificationToggle = (key: keyof NotificationPreferences['email_notifications']) => {
    setPreferences(prev => ({
      ...prev,
      email_notifications: {
        ...prev.email_notifications,
        [key]: !prev.email_notifications[key]
      }
    }))
  }

  const handlePushNotificationToggle = (key: keyof NotificationPreferences['push_notifications']) => {
    if (key === 'enabled') {
      // If enabling push notifications, request permission
      if (!preferences.push_notifications.enabled && pushSupported) {
        requestPushPermission()
      }
    }
    
    setPreferences(prev => ({
      ...prev,
      push_notifications: {
        ...prev.push_notifications,
        [key]: !prev.push_notifications[key]
      }
    }))
  }

  const requestPushPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        showToast('success', 'Notificaciones push habilitadas')
      } else {
        showToast('error', 'Se requiere permiso para las notificaciones push')
        setPreferences(prev => ({
          ...prev,
          push_notifications: {
            ...prev.push_notifications,
            enabled: false
          }
        }))
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      showToast('error', 'Error al solicitar permisos de notificación')
    }
  }

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      // Save preferences to the social_accounts JSON field
      const currentSocialAccounts = profile.social_accounts || {}
      const updatedSocialAccounts = {
        ...currentSocialAccounts,
        notification_preferences: preferences
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          social_accounts: updatedSocialAccounts,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      // Update local state
      const updatedProfile = {
        ...profile,
        social_accounts: updatedSocialAccounts,
        updated_at: new Date().toISOString()
      }
      
      onProfileUpdate(updatedProfile)
      showToast('success', 'Preferencias de notificaciones actualizadas correctamente')
      
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      showToast('error', 'Error al guardar las preferencias de notificaciones')
    } finally {
      setSaving(false)
    }
  }

  const EMAIL_NOTIFICATIONS = [
    {
      key: 'trial_expiration' as const,
      label: 'Expiración de Prueba',
      description: 'Recordatorios antes de que expire tu período de prueba'
    },
    {
      key: 'usage_limits' as const,
      label: 'Límites de Uso',
      description: 'Alertas cuando te acerques a los límites de tu plan'
    },
    {
      key: 'feature_updates' as const,
      label: 'Actualizaciones de Funciones',
      description: 'Notificaciones sobre nuevas características y mejoras'
    },
    {
      key: 'weekly_summary' as const,
      label: 'Resumen Semanal',
      description: 'Estadísticas y logros de la semana'
    },
    {
      key: 'content_tips' as const,
      label: 'Tips de Contenido',
      description: 'Consejos y mejores prácticas para tu estrategia'
    },
    {
      key: 'marketing_emails' as const,
      label: 'Emails de Marketing',
      description: 'Promociones, eventos y contenido educativo'
    }
  ]

  const PUSH_NOTIFICATIONS = [
    {
      key: 'content_published' as const,
      label: 'Contenido Publicado',
      description: 'Cuando tu contenido se publica en redes sociales'
    },
    {
      key: 'engagement_alerts' as const,
      label: 'Alertas de Engagement',
      description: 'Notificaciones sobre interacciones importantes'
    },
    {
      key: 'system_updates' as const,
      label: 'Actualizaciones del Sistema',
      description: 'Alertas críticas y mantenimiento programado'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Notificaciones por Email
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Configura qué tipos de emails quieres recibir
        </p>
        
        <div className="space-y-4">
          {EMAIL_NOTIFICATIONS.map(notification => (
            <div key={notification.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{notification.label}</h4>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications[notification.key]}
                  onChange={() => handleEmailNotificationToggle(notification.key)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer transition-colors ${
                  preferences.email_notifications[notification.key] ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                    preferences.email_notifications[notification.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <Smartphone className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Notificaciones Push
          </h3>
        </div>
        
        {!pushSupported && (
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-700">
              Las notificaciones push no son compatibles con tu navegador
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Enable Push Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Habilitar Notificaciones Push</h4>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Recibe notificaciones en tiempo real en tu dispositivo
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.push_notifications.enabled}
                onChange={() => handlePushNotificationToggle('enabled')}
                disabled={!pushSupported}
                className="sr-only"
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer transition-colors ${
                preferences.push_notifications.enabled ? 'bg-blue-600' : 'bg-gray-200'
              } ${!pushSupported ? 'opacity-50' : ''}`}>
                <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                  preferences.push_notifications.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
            </label>
          </div>

          {/* Individual Push Notifications */}
          {preferences.push_notifications.enabled && (
            <div className="space-y-4 ml-4">
              {PUSH_NOTIFICATIONS.map(notification => (
                <div key={notification.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{notification.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.push_notifications[notification.key]}
                      onChange={() => handlePushNotificationToggle(notification.key)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer transition-colors ${
                      preferences.push_notifications[notification.key] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                        preferences.push_notifications[notification.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Guardando...' : 'Guardar Preferencias'}</span>
        </Button>
      </div>
    </div>
  )
} 