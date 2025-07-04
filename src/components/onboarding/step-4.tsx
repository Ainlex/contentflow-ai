'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PenTool, Calendar, Tag, X } from 'lucide-react'

const step4Schema = z.object({
  content_types: z.array(z.string()).min(1, 'Selecciona al menos un tipo de contenido'),
  posting_frequency: z.string().min(1, 'Selecciona la frecuencia de publicación'),
  content_themes: z.array(z.string()).min(1, 'Agrega al menos un tema de contenido')
})

type Step4FormData = z.infer<typeof step4Schema>

interface Step4Props {
  data: Partial<Step4FormData>
  onNext: (data: Step4FormData) => void
  onBack: () => void
  isLoading?: boolean
}

export function Step4({ data, onNext, onBack, isLoading = false }: Step4Props) {
  const [error, setError] = useState<string | null>(null)
  const [contentThemes, setContentThemes] = useState<string[]>(data.content_themes || [])
  const [newTheme, setNewTheme] = useState('')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      ...data,
      content_themes: contentThemes
    }
  })

  const onSubmit = (formData: Step4FormData) => {
    setError(null)
    // Validar que tenemos al menos un tema
    if (contentThemes.length === 0) {
      setError('Agrega al menos un tema de contenido')
      return
    }
    onNext({
      ...formData,
      content_themes: contentThemes
    })
  }

  const contentTypesOptions = [
    { value: 'linkedin_posts', label: 'LinkedIn posts' },
    { value: 'twitter_posts', label: 'Twitter posts' },
    { value: 'instagram_posts', label: 'Instagram posts' },
    { value: 'blog_articles', label: 'Blog articles' },
    { value: 'email_newsletters', label: 'Email newsletters' }
  ]

  const postingFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: '3x_week', label: '3x/week' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-weekly' }
  ]

  const addTheme = () => {
    if (newTheme.trim() && !contentThemes.includes(newTheme.trim())) {
      const updatedThemes = [...contentThemes, newTheme.trim()]
      setContentThemes(updatedThemes)
      setValue('content_themes', updatedThemes)
      setNewTheme('')
    }
  }

  const removeTheme = (index: number) => {
    const updatedThemes = contentThemes.filter((_, i) => i !== index)
    setContentThemes(updatedThemes)
    setValue('content_themes', updatedThemes)
  }

  const handleThemeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTheme()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Objetivos de Contenido
        </h2>
        <p className="text-gray-600">
          Define qué tipo de contenido necesitas y con qué frecuencia
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Tipos de Contenido Necesarios *</Label>
          <div className="space-y-3">
            <Controller
              name="content_types"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contentTypesOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={field.value?.includes(option.value) || false}
                        onChange={(e) => {
                          const currentValues = field.value || []
                          if (e.target.checked) {
                            field.onChange([...currentValues, option.value])
                          } else {
                            field.onChange(currentValues.filter(v => v !== option.value))
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div className="flex items-center space-x-2">
                        <PenTool className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>
          {errors.content_types && (
            <p className="text-sm text-red-600">{errors.content_types.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="posting_frequency">Frecuencia de Publicación Objetivo *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              id="posting_frequency"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('posting_frequency')}
            >
              <option value="">Selecciona la frecuencia</option>
              {postingFrequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {errors.posting_frequency && (
            <p className="text-sm text-red-600">{errors.posting_frequency.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Temas Principales de Contenido *</Label>
          <p className="text-sm text-gray-500 mb-3">
            Agrega temas que quieres cubrir en tu contenido
          </p>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  onKeyPress={handleThemeKeyPress}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Marketing Digital, Productividad, Innovación..."
                />
              </div>
              <Button
                type="button"
                onClick={addTheme}
                disabled={!newTheme.trim()}
                className="px-4"
              >
                Agregar
              </Button>
            </div>

            {contentThemes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contentThemes.map((theme, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {theme}
                    <button
                      type="button"
                      onClick={() => removeTheme(index)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {(errors.content_themes || (contentThemes.length === 0 && error)) && (
            <p className="text-sm text-red-600">
              {errors.content_themes?.message || 'Agrega al menos un tema de contenido'}
            </p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Anterior
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Guardando...' : 'Siguiente'}
          </Button>
        </div>
      </form>
    </div>
  )
} 