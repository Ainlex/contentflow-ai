'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClientSupabaseClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientSupabaseClient()

  // Verificar si hay mensajes de confirmación de email
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'email_confirmed') {
      setSuccess('¡Email confirmado exitosamente! Ya puedes iniciar sesión.')
    } else if (message === 'signup_success') {
      setSuccess('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.')
    } else if (message === 'check_email') {
      setSuccess('Revisa tu bandeja de entrada. Si tu cuenta existe, recibirás instrucciones. Si es nueva, confirma tu email para activarla.')
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setError(error.message)
      } else if (authData.user) {
        setSuccess('¡Inicio de sesión exitoso! Redirigiendo...')
        
        // Verificar si el onboarding está completo
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', authData.user.id)
            .single()

          if (profileError) {
            console.log('Error fetching profile, going to onboarding')
            router.push('/onboarding')
          } else if (profile.onboarding_completed) {
            console.log('Onboarding completed, going to dashboard')
            router.push('/dashboard')
          } else {
            console.log('Onboarding not completed, going to onboarding')
            router.push('/onboarding')
          }
        } catch (err) {
          console.log('Error checking profile, going to onboarding')
          router.push('/onboarding')
        }
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'linkedin') => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Error al conectar con el proveedor OAuth.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    const email = document.querySelector<HTMLInputElement>('input[name="email"]')?.value
    if (!email) {
      setError('Por favor ingresa tu email primero')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Email de recuperación enviado. Revisa tu bandeja de entrada.')
      }
    } catch (err) {
      setError('Error al enviar email de recuperación.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tu contraseña"
              className="pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-sm text-indigo-600 hover:text-indigo-500"
            disabled={isLoading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">O continúa con</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin('google')}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Google'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin('linkedin')}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'LinkedIn'
          )}
        </Button>
      </div>
    </div>
  )
} 