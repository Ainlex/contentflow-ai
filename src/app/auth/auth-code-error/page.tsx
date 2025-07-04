'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const description = searchParams.get('description')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'invalid_grant':
        return 'El código de autorización es inválido o ha expirado.'
      case 'access_denied':
        return 'Acceso denegado. Intenta de nuevo.'
      case 'server_error':
        return 'Error del servidor. Intenta más tarde.'
      case 'temporarily_unavailable':
        return 'Servicio temporalmente no disponible.'
      default:
        return 'Ocurrió un error durante la autenticación.'
    }
  }

  const getErrorDescription = () => {
    if (description) {
      return decodeURIComponent(description)
    }
    return getErrorMessage(error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Error de Autenticación
          </h1>
          <p className="text-gray-600">
            No pudimos completar tu autenticación
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorDescription()}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">
              Posibles soluciones:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Verifica que el enlace no haya expirado</li>
              <li>• Asegúrate de usar el enlace completo del email</li>
              <li>• Intenta iniciar sesión nuevamente</li>
              <li>• Contacta soporte si el problema persiste</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </Button>
            
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al login
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <Link
              href="/support"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Contacta soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 