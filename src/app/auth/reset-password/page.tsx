import { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Restablecer Contraseña | ContentFlow',
  description: 'Restablece tu contraseña de ContentFlow',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-gray-600">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta
          </p>
        </div>

        <ResetPasswordForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Recordaste tu contraseña?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 