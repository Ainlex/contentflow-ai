'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building, Globe, User, Users } from 'lucide-react'

const step1Schema = z.object({
  company_name: z.string().min(1, 'El nombre de la empresa es requerido'),
  company_size: z.string().min(1, 'Selecciona el tamaño de la empresa'),
  role: z.string().min(1, 'Selecciona tu rol'),
  website_url: z.string().url('URL inválida').optional().or(z.literal(''))
})

type Step1FormData = z.infer<typeof step1Schema>

interface Step1Props {
  data: Partial<Step1FormData>
  onNext: (data: Step1FormData) => void
  onBack?: () => void
  isLoading?: boolean
}

export function Step1({ data, onNext, onBack, isLoading = false }: Step1Props) {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: data
  })

  const onSubmit = (formData: Step1FormData) => {
    setError(null)
    onNext(formData)
  }

  const companySizeOptions = [
    { value: '1-10', label: '1-10 empleados' },
    { value: '11-50', label: '11-50 empleados' },
    { value: '51-200', label: '51-200 empleados' },
    { value: '200+', label: '200+ empleados' }
  ]

  const roleOptions = [
    { value: 'founder', label: 'Founder' },
    { value: 'marketing_manager', label: 'Marketing Manager' },
    { value: 'content_creator', label: 'Content Creator' },
    { value: 'agency_owner', label: 'Agency Owner' }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información de tu Empresa
        </h2>
        <p className="text-gray-600">
          Cuéntanos sobre tu empresa para personalizar tu experiencia
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company_name">Nombre de la Empresa *</Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="company_name"
              type="text"
              placeholder="Mi Empresa"
              className="pl-10"
              {...register('company_name')}
            />
          </div>
          {errors.company_name && (
            <p className="text-sm text-red-600">{errors.company_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_size">Tamaño de la Empresa *</Label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              id="company_size"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('company_size')}
            >
              <option value="">Selecciona el tamaño</option>
              {companySizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {errors.company_size && (
            <p className="text-sm text-red-600">{errors.company_size.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Tu Rol *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              id="role"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('role')}
            >
              <option value="">Selecciona tu rol</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url">Website URL (opcional)</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="website_url"
              type="url"
              placeholder="https://miempresa.com"
              className="pl-10"
              {...register('website_url')}
            />
          </div>
          {errors.website_url && (
            <p className="text-sm text-red-600">{errors.website_url.message}</p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          {onBack ? (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              Anterior
            </Button>
          ) : (
            <div></div>
          )}
          
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