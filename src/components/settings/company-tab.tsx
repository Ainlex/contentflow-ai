'use client'

import { useState, useEffect } from 'react'
import { Building, Globe, Users, Target, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { createClientSupabaseClient } from '@/lib/auth'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface CompanyTabProps {
  profile: Profile | null
  onProfileUpdate: (profile: Profile) => void
}

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'marketing_agency', label: 'Marketing Agency' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'transport', label: 'Transport' },
  { value: 'energy', label: 'Energy' },
  { value: 'other', label: 'Other' }
]

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-200', label: '51-200 empleados' },
  { value: '200+', label: '200+ empleados' }
]

const BUSINESS_GOALS = [
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'customer_retention', label: 'Customer Retention' },
  { value: 'sales', label: 'Sales' },
  { value: 'improve_engagement', label: 'Improve Engagement' },
  { value: 'educate_audience', label: 'Educate Audience' },
  { value: 'thought_leadership', label: 'Thought Leadership' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'market_expansion', label: 'Market Expansion' },
  { value: 'build_community', label: 'Build Community' }
]

export function CompanyTab({ profile, onProfileUpdate }: CompanyTabProps) {
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    website_url: '',
    target_audience: '',
    business_goals: [] as string[]
  })
  const [isSaving, setSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { showToast } = useToast()
  const supabase = createClientSupabaseClient()

  // Cargar datos del perfil cuando el componente se monta o cuando cambia el profile
  useEffect(() => {
    const loadProfileData = () => {
      if (profile) {
        const newFormData = {
          company_name: profile.company_name || '',
          industry: profile.industry || '',
          company_size: profile.company_size || '',
          website_url: profile.website_url || '',
          target_audience: profile.target_audience || '',
          business_goals: profile.business_goals || []
        }
        setFormData(newFormData)
        setIsLoading(false)
      } else {
        setIsLoading(true)
      }
    }

    loadProfileData()
  }, [profile])

  // Asegurar que no estemos en loading si ya tenemos datos
  useEffect(() => {
    if (formData.company_name || formData.industry || formData.company_size) {
      setIsLoading(false)
    }
  }, [formData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'El nombre de la empresa es requerido'
    }
    
    if (!formData.industry) {
      newErrors.industry = 'La industria es requerida'
    }
    
    if (!formData.company_size) {
      newErrors.company_size = 'El tamaño de la empresa es requerido'
    }
    
    if (formData.website_url && !isValidUrl(formData.website_url)) {
      newErrors.website_url = 'Por favor ingresa una URL válida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBusinessGoalToggle = (goalValue: string) => {
    setFormData(prev => ({
      ...prev,
      business_goals: prev.business_goals.includes(goalValue)
        ? prev.business_goals.filter(g => g !== goalValue)
        : [...prev.business_goals, goalValue]
    }))
  }

  const handleSave = async () => {
    if (!validateForm() || !profile) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: formData.company_name,
          industry: formData.industry,
          company_size: formData.company_size,
          website_url: formData.website_url || null,
          target_audience: formData.target_audience || null,
          business_goals: formData.business_goals,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      // Update local state
      const updatedProfile = {
        ...profile,
        company_name: formData.company_name,
        industry: formData.industry,
        company_size: formData.company_size,
        website_url: formData.website_url || null,
        target_audience: formData.target_audience || null,
        business_goals: formData.business_goals,
        updated_at: new Date().toISOString()
      }
      
      onProfileUpdate(updatedProfile)
      showToast('success', 'Información de empresa actualizada correctamente')
      
    } catch (error) {
      console.error('Error saving company data:', error)
      showToast('error', 'Error al guardar la información de empresa')
    } finally {
      setSaving(false)
    }
  }

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando información de empresa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información de la Empresa
        </h3>
        
        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <Label htmlFor="company_name">Nombre de la Empresa</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className="pl-10"
                placeholder="Mi Empresa S.A."
              />
            </div>
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <Label htmlFor="industry">Industria</Label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una industria</option>
              {INDUSTRIES.map(industry => (
                <option 
                  key={industry.value} 
                  value={industry.value}
                >
                  {industry.label}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
            )}
          </div>

          {/* Company Size */}
          <div>
            <Label htmlFor="company_size">Tamaño de la Empresa</Label>
            <select
              id="company_size"
              value={formData.company_size}
              onChange={(e) => handleInputChange('company_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona el tamaño</option>
              {COMPANY_SIZES.map(size => (
                <option 
                  key={size.value} 
                  value={size.value}
                >
                  {size.label}
                </option>
              ))}
            </select>
            {errors.company_size && (
              <p className="mt-1 text-sm text-red-600">{errors.company_size}</p>
            )}
          </div>

          {/* Website URL */}
          <div>
            <Label htmlFor="website_url">Sitio Web</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                className="pl-10"
                placeholder="https://miempresa.com"
              />
            </div>
            {errors.website_url && (
              <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <Label htmlFor="target_audience">Audiencia Objetivo</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                className="pl-10"
                placeholder="Empresas B2B, jóvenes profesionales, etc."
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Describe tu audiencia principal
            </p>
          </div>
        </div>
      </div>

      {/* Business Goals */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Objetivos de Negocio
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Selecciona los objetivos que quieres lograr con tu estrategia de contenido
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BUSINESS_GOALS.map(goal => (
            <label 
              key={goal.value} 
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.business_goals.includes(goal.value)}
                onChange={() => handleBusinessGoalToggle(goal.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{goal.label}</span>
            </label>
          ))}
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
    </div>
  )
} 