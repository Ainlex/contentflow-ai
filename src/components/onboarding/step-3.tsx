'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageSquare, FileText, Heart, X } from 'lucide-react'

const step3Schema = z.object({
  brand_voice_tone: z.string().min(1, 'Selecciona el tono de tu marca'),
  content_examples: z.array(z.string()).min(1, 'Agrega al menos un ejemplo de contenido').max(3, 'Máximo 3 ejemplos'),
  key_messages: z.string().min(10, 'Describe tus mensajes clave (mínimo 10 caracteres)'),
  words_to_avoid: z.string().optional()
})

type Step3FormData = z.infer<typeof step3Schema>

interface Step3Props {
  data: Partial<Step3FormData>
  onNext: (data: Step3FormData) => void
  onBack: () => void
  isLoading?: boolean
}

export function Step3({ data, onNext, onBack, isLoading = false }: Step3Props) {
  const [error, setError] = useState<string | null>(null)
  const [contentExamples, setContentExamples] = useState<string[]>(data.content_examples || [''])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      ...data,
      content_examples: contentExamples
    }
  })

  const onSubmit = (formData: Step3FormData) => {
    setError(null)
    const filteredExamples = contentExamples.filter(example => example.trim() !== '')
    onNext({
      ...formData,
      content_examples: filteredExamples
    })
  }

  const brandVoiceToneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'creative', label: 'Creative' }
  ]

  const addContentExample = () => {
    if (contentExamples.length < 3) {
      setContentExamples([...contentExamples, ''])
    }
  }

  const removeContentExample = (index: number) => {
    if (contentExamples.length > 1) {
      setContentExamples(contentExamples.filter((_, i) => i !== index))
    }
  }

  const updateContentExample = (index: number, value: string) => {
    const updated = [...contentExamples]
    updated[index] = value
    setContentExamples(updated)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ejemplos de Voz de Marca
        </h2>
        <p className="text-gray-600">
          Ayúdanos a entender el tono y estilo de tu marca
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="brand_voice_tone">Tono de Voz de Marca *</Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              id="brand_voice_tone"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('brand_voice_tone')}
            >
              <option value="">Selecciona el tono de tu marca</option>
              {brandVoiceToneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {errors.brand_voice_tone && (
            <p className="text-sm text-red-600">{errors.brand_voice_tone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Ejemplos de Contenido Existente * (1-3 ejemplos)</Label>
          <p className="text-sm text-gray-500 mb-3">
            Pega ejemplos de posts, emails, o contenido que represente tu marca
          </p>
          <div className="space-y-3">
            {contentExamples.map((example, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-3 flex-shrink-0" />
                  <div className="flex-1">
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder={`Ejemplo ${index + 1}: Pega aquí tu contenido existente...`}
                      value={example}
                      onChange={(e) => updateContentExample(index, e.target.value)}
                    />
                  </div>
                  {contentExamples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContentExample(index)}
                      className="p-1 text-red-500 hover:text-red-700 mt-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {contentExamples.length < 3 && (
              <button
                type="button"
                onClick={addContentExample}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Agregar otro ejemplo
              </button>
            )}
          </div>
          {errors.content_examples && (
            <p className="text-sm text-red-600">{errors.content_examples.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="key_messages">Mensajes Clave / Valores *</Label>
          <div className="relative">
            <Heart className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              id="key_messages"
              rows={4}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Describe los mensajes clave, valores y temas principales que quieres comunicar..."
              {...register('key_messages')}
            />
          </div>
          {errors.key_messages && (
            <p className="text-sm text-red-600">{errors.key_messages.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="words_to_avoid">Palabras a Evitar (opcional)</Label>
          <div className="relative">
            <X className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              id="words_to_avoid"
              rows={3}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Lista palabras, frases o tonos que prefieres evitar en tu contenido..."
              {...register('words_to_avoid')}
            />
          </div>
          {errors.words_to_avoid && (
            <p className="text-sm text-red-600">{errors.words_to_avoid.message}</p>
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