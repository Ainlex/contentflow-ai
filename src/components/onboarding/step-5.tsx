'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, ExternalLink, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react'

const step5Schema = z.object({
  social_accounts: z.record(z.boolean()).optional()
})

type Step5FormData = z.infer<typeof step5Schema>

interface Step5Props {
  data: Partial<Step5FormData>
  onNext: (data: Step5FormData) => void
  onBack: () => void
  onComplete: () => void
  isLoading?: boolean
}

export function Step5({ data, onNext, onBack, onComplete, isLoading = false }: Step5Props) {
  const [error, setError] = useState<string | null>(null)
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>(
    data.social_accounts || {}
  )
  const [isConnecting, setIsConnecting] = useState<Record<string, boolean>>({})

  const {
    handleSubmit,
  } = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: data
  })

  const onSubmit = (formData: Step5FormData) => {
    setError(null)
    onNext({
      ...formData,
      social_accounts: connectedAccounts
    })
  }

  const socialPlatforms = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Conecta tu perfil profesional de LinkedIn'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      description: 'Conecta tu cuenta de Twitter/X'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-600 hover:bg-pink-700',
      description: 'Conecta tu cuenta de Instagram'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-700 hover:bg-blue-800',
      description: 'Conecta tu página de Facebook'
    }
  ]

  const handleConnect = async (platformId: string) => {
    setIsConnecting(prev => ({ ...prev, [platformId]: true }))
    setError(null)

    try {
      // Simular conexión OAuth (en implementación real aquí iría la lógica de OAuth)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Por ahora simularemos una conexión exitosa
      setConnectedAccounts(prev => ({
        ...prev,
        [platformId]: true
      }))
    } catch (err) {
      setError(`Error al conectar con ${platformId}. Intenta de nuevo.`)
    } finally {
      setIsConnecting(prev => ({ ...prev, [platformId]: false }))
    }
  }

  const handleDisconnect = (platformId: string) => {
    setConnectedAccounts(prev => {
      const updated = { ...prev }
      delete updated[platformId]
      return updated
    })
  }

  const handleSkipAndComplete = () => {
    onComplete()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Conectar Redes Sociales
        </h2>
        <p className="text-gray-600">
          Conecta tus redes sociales para automatizar la publicación de contenido
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Todas las conexiones son opcionales y puedes configurarlas más tarde
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Label>Cuentas de Redes Sociales (Opcional)</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => {
              const IconComponent = platform.icon
              const isConnected = connectedAccounts[platform.id]
              const isConnectingThis = isConnecting[platform.id]

              return (
                <div
                  key={platform.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-500">{platform.description}</p>
                      </div>
                    </div>
                    
                    {isConnected && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {isConnected ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(platform.id)}
                          className="flex-1"
                        >
                          Desconectar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="px-3"
                          title="Ver configuración"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnectingThis || isLoading}
                        className={`w-full ${platform.color} text-white`}
                      >
                        {isConnectingThis ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Conectando...
                          </>
                        ) : (
                          <>
                            <IconComponent className="h-4 w-4 mr-2" />
                            Conectar {platform.name}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-medium text-indigo-900 mb-2">
            ¿Por qué conectar redes sociales?
          </h3>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• Publicación automática de contenido</li>
            <li>• Programación de posts</li>
            <li>• Análisis de rendimiento</li>
            <li>• Gestión centralizada</li>
          </ul>
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
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipAndComplete}
              disabled={isLoading}
            >
              Saltar y Completar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? 'Finalizando...' : 'Completar Setup'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 