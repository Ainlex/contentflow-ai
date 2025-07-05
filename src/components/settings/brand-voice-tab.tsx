'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Volume2, Sparkles, Plus, X, Save, Wand2, PenTool } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { createClientSupabaseClient } from '@/lib/auth'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface BrandVoiceTabProps {
  profile: Profile | null
  onProfileUpdate: (profile: Profile) => void
}

const BRAND_TONES = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Formal, confiable y experticia'
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relajado, accesible y conversacional'
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Cálido, acogedor y personal'
  },
  {
    value: 'authoritative',
    label: 'Authoritative',
    description: 'Seguro, líder de pensamiento'
  },
  {
    value: 'creative',
    label: 'Creative',
    description: 'Innovador, artístico y original'
  },
  {
    value: 'inspirational',
    label: 'Inspirational',
    description: 'Motivador, positivo y energético'
  },
  {
    value: 'playful',
    label: 'Playful',
    description: 'Juguetón, divertido y entretenido'
  },
  {
    value: 'empathetic',
    label: 'Empathetic',
    description: 'Comprensivo, solidario y humano'
  }
]

const CONTENT_TYPES = [
  { value: 'linkedin_posts', label: 'LinkedIn posts' },
  { value: 'twitter_posts', label: 'Twitter posts' },
  { value: 'instagram_posts', label: 'Instagram posts' },
  { value: 'blog_articles', label: 'Blog articles' },
  { value: 'email_newsletters', label: 'Email newsletters' }
]

const POSTING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: '3x_week', label: '3x/week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' }
]

export function BrandVoiceTab({ profile, onProfileUpdate }: BrandVoiceTabProps) {
  const [formData, setFormData] = useState({
    brand_voice_tone: '',
    key_messages: '',
    words_to_avoid: '',
    content_examples: [] as string[],
    content_types: [] as string[],
    posting_frequency: '',
    content_themes: [] as string[]
  })
  const [newContentExample, setNewContentExample] = useState('')
  const [newContentTheme, setNewContentTheme] = useState('')
  const [isSaving, setSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sampleContent, setSampleContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { showToast } = useToast()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    if (profile) {
      setFormData({
        brand_voice_tone: profile.brand_voice_tone || '',
        key_messages: profile.key_messages || '',
        words_to_avoid: profile.words_to_avoid || '',
        content_examples: profile.content_examples || [],
        content_types: profile.content_types || [],
        posting_frequency: profile.posting_frequency || '',
        content_themes: profile.content_themes || []
      })
    }
  }, [profile])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.brand_voice_tone) {
      newErrors.brand_voice_tone = 'Selecciona un tono de marca'
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

  const handleToneSelect = (tone: string) => {
    setFormData(prev => ({ ...prev, brand_voice_tone: tone }))
    if (errors.brand_voice_tone) {
      setErrors(prev => ({ ...prev, brand_voice_tone: '' }))
    }
  }

  const addContentExample = () => {
    if (newContentExample.trim() && !formData.content_examples.includes(newContentExample.trim())) {
      setFormData(prev => ({
        ...prev,
        content_examples: [...prev.content_examples, newContentExample.trim()]
      }))
      setNewContentExample('')
    }
  }

  const removeContentExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content_examples: prev.content_examples.filter((_, i) => i !== index)
    }))
  }

  const handleContentTypeToggle = (contentType: string) => {
    setFormData(prev => ({
      ...prev,
      content_types: prev.content_types.includes(contentType)
        ? prev.content_types.filter(t => t !== contentType)
        : [...prev.content_types, contentType]
    }))
  }

  const addContentTheme = () => {
    if (newContentTheme.trim() && !formData.content_themes.includes(newContentTheme.trim())) {
      setFormData(prev => ({
        ...prev,
        content_themes: [...prev.content_themes, newContentTheme.trim()]
      }))
      setNewContentTheme('')
    }
  }

  const removeContentTheme = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content_themes: prev.content_themes.filter((_, i) => i !== index)
    }))
  }

  const generateSampleContent = async () => {
    if (!formData.brand_voice_tone || !profile?.company_name) {
      showToast('error', 'Por favor completa el tono de marca y el nombre de la empresa')
      return
    }

    setIsGenerating(true)
    try {
      // Mock AI generation - En un proyecto real, aquí harías una llamada a la API de AI
      const mockContent = `🚀 En ${profile.company_name}, creemos que ${formData.key_messages || 'la innovación impulsa el progreso'}. 

Nuestro enfoque ${formData.brand_voice_tone} nos permite conectar con ${profile.target_audience || 'nuestra audiencia'} de manera auténtica.

${formData.content_examples.length > 0 ? `Como ejemplo: "${formData.content_examples[0]}"` : ''}

¿Qué opinas? ¡Nos encantaría conocer tu perspectiva!`

      setSampleContent(mockContent)
      showToast('success', 'Contenido de prueba generado exitosamente')
    } catch (error) {
      console.error('Error generating sample content:', error)
      showToast('error', 'Error al generar contenido de prueba')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!validateForm() || !profile) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          brand_voice_tone: formData.brand_voice_tone,
          key_messages: formData.key_messages || null,
          words_to_avoid: formData.words_to_avoid || null,
          content_examples: formData.content_examples,
          content_types: formData.content_types,
          posting_frequency: formData.posting_frequency || null,
          content_themes: formData.content_themes,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      // Update local state
      const updatedProfile = {
        ...profile,
        brand_voice_tone: formData.brand_voice_tone,
        key_messages: formData.key_messages || null,
        words_to_avoid: formData.words_to_avoid || null,
        content_examples: formData.content_examples,
        content_types: formData.content_types,
        posting_frequency: formData.posting_frequency || null,
        content_themes: formData.content_themes,
        updated_at: new Date().toISOString()
      }
      
      onProfileUpdate(updatedProfile)
      showToast('success', 'Configuración de voz de marca actualizada correctamente')
      
    } catch (error) {
      console.error('Error saving brand voice data:', error)
      showToast('error', 'Error al guardar la configuración de voz de marca')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand Tone Selection */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <Volume2 className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Tono de Marca
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Selecciona el tono que mejor represente la personalidad de tu marca
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BRAND_TONES.map(tone => (
            <label 
              key={tone.value} 
              className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.brand_voice_tone === tone.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="brand_tone"
                value={tone.value}
                checked={formData.brand_voice_tone === tone.value}
                onChange={() => handleToneSelect(tone.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900">{tone.label}</div>
                <div className="text-sm text-gray-600">{tone.description}</div>
              </div>
            </label>
          ))}
        </div>
        
        {errors.brand_voice_tone && (
          <p className="mt-2 text-sm text-red-600">{errors.brand_voice_tone}</p>
        )}
      </div>

      {/* Key Messages */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Mensajes Clave
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="key_messages">Valores y Mensajes Principales</Label>
            <textarea
              id="key_messages"
              value={formData.key_messages}
              onChange={(e) => handleInputChange('key_messages', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Innovación, calidad, servicio al cliente, sostenibilidad..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Describe los valores y mensajes que quieres transmitir
            </p>
          </div>

          <div>
            <Label htmlFor="words_to_avoid">Palabras a Evitar</Label>
            <textarea
              id="words_to_avoid"
              value={formData.words_to_avoid}
              onChange={(e) => handleInputChange('words_to_avoid', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: gratis, barato, imposible, nunca..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Palabras que no se alinean con tu marca
            </p>
          </div>
        </div>
      </div>

      {/* Content Examples */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Ejemplos de Contenido
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Agrega ejemplos de contenido que representen tu voz de marca
        </p>
        
        <div className="space-y-3">
          {/* Add new example */}
          <div className="flex space-x-2">
            <Input
              value={newContentExample}
              onChange={(e) => setNewContentExample(e.target.value)}
              placeholder="Ej: Transformamos ideas en realidad digital..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && addContentExample()}
            />
            <Button
              onClick={addContentExample}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar</span>
            </Button>
          </div>

          {/* Existing examples */}
          {formData.content_examples.map((example, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 text-sm text-gray-700">
                {example}
              </div>
              <button
                onClick={() => removeContentExample(index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Content Strategy */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <PenTool className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Estrategia de Contenido
          </h3>
        </div>
        
        <div className="space-y-6">
          {/* Content Types */}
          <div>
            <Label>Tipos de Contenido</Label>
            <p className="text-sm text-gray-600 mb-3">
              Selecciona los tipos de contenido que necesitas
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONTENT_TYPES.map(type => (
                <label 
                  key={type.value} 
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.content_types.includes(type.value)}
                    onChange={() => handleContentTypeToggle(type.value)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Posting Frequency */}
          <div>
            <Label htmlFor="posting_frequency">Frecuencia de Publicación</Label>
            <select
              id="posting_frequency"
              value={formData.posting_frequency}
              onChange={(e) => handleInputChange('posting_frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona la frecuencia</option>
              {POSTING_FREQUENCIES.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content Themes */}
          <div>
            <Label>Temas de Contenido</Label>
            <p className="text-sm text-gray-600 mb-3">
              Agrega temas principales para tu contenido
            </p>
            
            <div className="space-y-3">
              {/* Add new theme */}
              <div className="flex space-x-2">
                <Input
                  value={newContentTheme}
                  onChange={(e) => setNewContentTheme(e.target.value)}
                  placeholder="Ej: Marketing Digital, Productividad, Innovación..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addContentTheme()}
                />
                <Button
                  onClick={addContentTheme}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar</span>
                </Button>
              </div>

              {/* Existing themes */}
              {formData.content_themes.map((theme, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 text-sm text-gray-700">
                    {theme}
                  </div>
                  <button
                    onClick={() => removeContentTheme(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Voice Testing */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <Wand2 className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Prueba de Voz de Marca
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Genera contenido de prueba para ver cómo se aplica tu voz de marca
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={generateSampleContent}
            disabled={isGenerating || !formData.brand_voice_tone}
            className="flex items-center space-x-2"
          >
            <Wand2 className="h-4 w-4" />
            <span>{isGenerating ? 'Generando...' : 'Generar Contenido de Prueba'}</span>
          </Button>

          {sampleContent && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Contenido Generado:
              </h4>
              <div className="text-sm text-blue-800 whitespace-pre-wrap">
                {sampleContent}
              </div>
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
          <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </Button>
      </div>
    </div>
  )
} 