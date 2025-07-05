'use client'

import { useState } from 'react'
import { useContentGeneration } from '@/hooks/useContentGeneration'
import { ContentType, ToneType, CONTENT_PLATFORMS, TONE_OPTIONS } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ContentRecycler from './ContentRecycler'

export function ContentGenerator() {
  const [formData, setFormData] = useState({
    topic: '',
    tone: 'professional' as ToneType,
    targetAudience: '',
    contentType: 'linkedin' as ContentType,
    additionalContext: '',
  })

  const {
    isGenerating,
    generatedContent,
    error,
    isComplete,
    progress,
    generateContent,
    cancelGeneration,
    resetState,
    copyToClipboard,
  } = useContentGeneration()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.topic || !formData.targetAudience) {
      return
    }

    await generateContent(formData)
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(generatedContent)
    if (success) {
      // Aquí podrías agregar un toast notification
      console.log('Contenido copiado al portapapeles')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const currentPlatform = CONTENT_PLATFORMS[formData.contentType]
  const currentTone = TONE_OPTIONS[formData.tone]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Generador de Contenido AI
            </h1>
            <p className="text-gray-600 mt-2">
              Crea contenido optimizado para diferentes plataformas sociales
            </p>
          </div>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generar Contenido</TabsTrigger>
              <TabsTrigger value="recycle">Reciclar Contenido</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Formulario */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tema */}
                <div>
                  <Label htmlFor="topic">Tema o Tópico *</Label>
                  <Input
                    id="topic"
                    type="text"
                    placeholder="Ej: Tendencias de marketing digital 2024"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    required
                  />
                </div>

                {/* Audiencia */}
                <div>
                  <Label htmlFor="audience">Audiencia Objetivo *</Label>
                  <Input
                    id="audience"
                    type="text"
                    placeholder="e.g. marketing managers, content creators, agencias B2B"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    required
                  />
                </div>

                {/* Tipo de Contenido */}
                <div>
                  <Label htmlFor="contentType">Plataforma</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(CONTENT_PLATFORMS).map(([key, platform]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleInputChange('contentType', key)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.contentType === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{platform.icon}</span>
                          <div>
                            <p className={`font-medium ${platform.color}`}>
                              {platform.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {platform.maxLength} caracteres
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tono */}
                <div>
                  <Label htmlFor="tone">Tono de Voz</Label>
                  <select
                    id="tone"
                    value={formData.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(TONE_OPTIONS).map(([key, tone]) => (
                      <option key={key} value={key}>
                        {tone.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentTone.description}
                  </p>
                </div>

                {/* Contexto Adicional */}
                <div>
                  <Label htmlFor="context">Contexto Adicional (Opcional)</Label>
                  <textarea
                    id="context"
                    placeholder="Información adicional, palabras clave específicas, etc."
                    value={formData.additionalContext}
                    onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={isGenerating || !formData.topic || !formData.targetAudience}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generando...' : 'Generar Contenido'}
                  </Button>
                  
                  {isGenerating && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelGeneration}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>

              {/* Información de la Plataforma */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  {currentPlatform.icon} {currentPlatform.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {currentPlatform.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentPlatform.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-white px-2 py-1 rounded text-gray-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    Contenido Generado
                  </h3>
                  {isComplete && generatedContent && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                    >
                      Copiar
                    </Button>
                  )}
                </div>

                {/* Barra de Progreso */}
                {isGenerating && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Generando...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Contenido */}
                <div className="space-y-2">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetState}
                        className="mt-2"
                      >
                        Reintentar
                      </Button>
                    </div>
                  )}

                  {generatedContent && (
                    formData.contentType === 'email' ? (
                      (() => {
                        // Intentar extraer subject y body
                        const subjectMatch = generatedContent.match(/subject\s*[:\-]?\s*(.*)/i);
                        const bodyMatch = generatedContent.match(/body\s*[:\-]?\s*([\s\S]*)/i);
                        const subject = subjectMatch ? subjectMatch[1].trim() : '';
                        const body = bodyMatch ? bodyMatch[1].trim() : generatedContent;
                        return (
                          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                            <div>
                              <span className="font-semibold">Subject:</span> {subject || 'No detectado'}
                            </div>
                            <div>
                              <span className="font-semibold">Body:</span>
                              <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans mt-1">{body}</pre>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                          {generatedContent}
                          {isGenerating && (
                            <span className="animate-pulse bg-blue-500 text-blue-500 ml-1">|</span>
                          )}
                        </pre>
                      </div>
                    )
                  )}

                  {!generatedContent && !isGenerating && !error && (
                    <div className="text-center text-gray-500 py-12">
                      <p>El contenido generado aparecerá aquí</p>
                    </div>
                  )}
                </div>

                {/* Estadísticas */}
                {generatedContent && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Palabras: {generatedContent.split(' ').length}
                      </span>
                      <span>
                        Caracteres: {generatedContent.length} / {currentPlatform.maxLength}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
            </TabsContent>

            <TabsContent value="recycle" className="space-y-6">
              <div className="p-6">
                <ContentRecycler 
                  initialContent={generatedContent || ''}
                  onContentGenerated={(recycledContent) => {
                    console.log('Contenido reciclado:', recycledContent);
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 