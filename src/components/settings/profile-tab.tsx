'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Lock, Trash2, Camera, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { ConfirmModal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { createClientSupabaseClient } from '@/lib/auth'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileTabProps {
  profile: Profile | null
  onProfileUpdate: (profile: Profile) => void
}

export function ProfileTab({ profile, onProfileUpdate }: ProfileTabProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    profile_picture: '',
    password: '',
    confirmPassword: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { showToast } = useToast()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.company_name || '',
        email: profile.email || '',
        profile_picture: '', // Will be handled separately
        password: '',
        confirmPassword: ''
      })
    }
  }, [profile])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido'
    }
    
    if (showPasswordChange) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida'
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!profile) return
    
    setIsUploading(true)
    try {
      // Delete old image if exists
      if (profile.company_name) {
        await supabase.storage
          .from('profile-pictures')
          .remove([`${profile.id}/profile-picture`])
      }

      // Upload new image
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/profile-picture.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          company_name: formData.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (updateError) {
        throw updateError
      }

      setFormData(prev => ({ ...prev, profile_picture: publicUrl }))
      showToast('success', 'Foto de perfil actualizada correctamente')
      
    } catch (error) {
      console.error('Error uploading image:', error)
      showToast('error', 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!profile) return
    
    try {
      await supabase.storage
        .from('profile-pictures')
        .remove([`${profile.id}/profile-picture`])

      setFormData(prev => ({ ...prev, profile_picture: '' }))
      showToast('success', 'Foto de perfil eliminada')
    } catch (error) {
      console.error('Error removing image:', error)
      showToast('error', 'Error al eliminar la imagen')
    }
  }

  const handleSave = async () => {
    if (!validateForm() || !profile) return
    
    setSaving(true)
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_name: formData.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (profileError) {
        throw profileError
      }

      // Update password if requested
      if (showPasswordChange && formData.password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: formData.password
        })

        if (authError) {
          throw authError
        }
      }

      // Update local state
      const updatedProfile = {
        ...profile,
        company_name: formData.full_name,
        updated_at: new Date().toISOString()
      }
      
      onProfileUpdate(updatedProfile)
      showToast('success', 'Perfil actualizado correctamente')
      
      // Reset password fields
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      setShowPasswordChange(false)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      showToast('error', 'Error al guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!profile) return
    
    try {
      // Delete profile picture from storage
      await supabase.storage
        .from('profile-pictures')
        .remove([`${profile.id}/profile-picture`])

      // Delete user account (this will cascade delete profile)
      const { error } = await supabase.auth.admin.deleteUser(profile.id)
      
      if (error) {
        throw error
      }

      showToast('success', 'Cuenta eliminada correctamente')
      
      // Redirect to login
      window.location.href = '/auth/login'
      
    } catch (error) {
      console.error('Error deleting account:', error)
      showToast('error', 'Error al eliminar la cuenta')
    }
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información Personal
        </h3>
        
        <div className="space-y-4">
          {/* Profile Picture */}
          <div>
            <Label>Foto de Perfil</Label>
            <div className="mt-2">
              <FileUpload
                onFileSelect={handleImageUpload}
                currentImage={formData.profile_picture}
                onRemove={handleRemoveImage}
                maxSize={5}
                accept="image/*"
              />
              {isUploading && (
                <div className="mt-2 text-sm text-blue-600">
                  Subiendo imagen...
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="full_name">Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="pl-10"
                placeholder="Tu nombre completo"
              />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              El email no se puede cambiar
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Seguridad
        </h3>
        
        <div className="space-y-4">
          {!showPasswordChange ? (
            <Button
              variant="outline"
              onClick={() => setShowPasswordChange(true)}
              className="flex items-center space-x-2"
            >
              <Lock className="h-4 w-4" />
              <span>Cambiar Contraseña</span>
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordChange(false)
                  setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
                  setErrors(prev => ({ ...prev, password: '', confirmPassword: '' }))
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones de Cuenta
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h4 className="font-medium text-red-900">Eliminar Cuenta</h4>
              <p className="text-sm text-red-700">
                Esta acción no se puede deshacer. Se eliminarán todos tus datos.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </Button>
          </div>
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
          <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </Button>
      </div>

      {/* Delete Account Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Eliminar Cuenta"
        message="¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se perderán todos tus datos."
        confirmText="Eliminar Cuenta"
        variant="destructive"
      />
    </div>
  )
} 