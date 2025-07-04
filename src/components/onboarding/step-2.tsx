'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Briefcase, Target, TrendingUp } from 'lucide-react'

const step2Schema = z.object({
  industry: z.string().min(1, 'Selecciona una industria'),
  target_audience: z.string().min(10, 'Describe tu audiencia objetivo (mínimo 10 caracteres)'),
  business_goals: z.array(z.string()).min(1, 'Selecciona al menos un objetivo de negocio')
})

type Step2FormData = z.infer<typeof step2Schema>

interface Step2Props {
  data: Partial<Step2FormData>
  onNext: (data: Step2FormData) => void
  onBack: () => void
  isLoading?: boolean
}

export function Step2({ data, onNext, onBack, isLoading = false }: Step2Props) {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: data
  })

  const onSubmit = (formData: Step2FormData) => {
    setError(null)
    onNext(formData)
  }

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'marketing_agency', label: 'Marketing Agency' },
    { value: 'other', label: 'Other' }
  ]

  const businessGoalsOptions = [
    { value: 'lead_generation', label: 'Lead Generation' },
    { value: 'brand_awareness', label: 'Brand Awareness' },
    { value: 'customer_retention', label: 'Customer Retention' },
    { value: 'sales', label: 'Sales' }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selección de Industria
        </h2>
        <p className="text-gray-600">
          Ayúdanos a entender tu industria y objetivos de negocio
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="industry">Industria *</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              id="industry"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('industry')}
            >
              <option value="">Selecciona tu industria</option>
              {industryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {errors.industry && (
            <p className="text-sm text-red-600">{errors.industry.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_audience">Descripción de Audiencia Objetivo *</Label>
          <div className="relative">
            <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              id="target_audience"
              rows={4}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Describe tu audiencia objetivo: demografía, intereses, comportamientos, necesidades..."
              {...register('target_audience')}
            />
          </div>
          {errors.target_audience && (
            <p className="text-sm text-red-600">{errors.target_audience.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Objetivos Principales de Negocio *</Label>
          <div className="space-y-3">
            <Controller
              name="business_goals"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {businessGoalsOptions.map((option) => (
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
                        <TrendingUp className="h-4 w-4 text-gray-400" />
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
          {errors.business_goals && (
            <p className="text-sm text-red-600">{errors.business_goals.message}</p>
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