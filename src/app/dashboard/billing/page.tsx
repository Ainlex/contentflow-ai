'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Check, 
  Star, 
  Clock, 
  AlertCircle,
  Download,
  Calendar
} from 'lucide-react'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth/login')
          return
        }

        const { data: subscriptionData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (subError) {
          console.log('Error fetching subscription:', subError)
        } else {
          setSubscription(subscriptionData)
        }
      } catch (err) {
        console.log('Error fetching subscription:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [router, supabase])

  const getTrialDaysRemaining = () => {
    if (!subscription?.trial_ends_at) return 0
    return Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
  }

  const plans = [
    {
      name: 'Starter',
      price: '$19',
      period: '/mes',
      description: 'Perfecto para empezar',
      features: [
        '50 generaciones de IA por mes',
        '2 cuentas sociales',
        'Programación básica',
        'Soporte por email'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$49',
      period: '/mes',
      description: 'Para empresas en crecimiento',
      features: [
        '200 generaciones de IA por mes',
        '5 cuentas sociales',
        'Programación avanzada',
        'Analytics detallados',
        'Soporte prioritario'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/mes',
      description: 'Para equipos grandes',
      features: [
        'Generaciones ilimitadas',
        'Cuentas sociales ilimitadas',
        'Colaboración en equipo',
        'Analytics avanzados',
        'Soporte telefónico',
        'Integración personalizada'
      ],
      popular: false
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de facturación...</p>
        </div>
      </div>
    )
  }

  const trialDaysRemaining = getTrialDaysRemaining()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
          <p className="text-gray-600">Gestiona tu suscripción y métodos de pago</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Plan Actual</h2>
          </div>
          {subscription?.plan_type === 'trial' && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-full">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">
                {trialDaysRemaining} días de trial
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Plan</p>
            <p className="text-xl font-semibold text-gray-900 capitalize">
              {subscription?.plan_type || 'Trial'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Estado</p>
            <p className="text-xl font-semibold text-gray-900 capitalize">
              {subscription?.status || 'Activo'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Próxima facturación</p>
            <p className="text-xl font-semibold text-gray-900">
              {subscription?.trial_ends_at 
                ? new Date(subscription.trial_ends_at).toLocaleDateString('es-ES')
                : 'N/A'
              }
            </p>
          </div>
        </div>

        {subscription?.plan_type === 'trial' && trialDaysRemaining <= 3 && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Tu trial está terminando</p>
                <p className="text-sm text-orange-600">
                  Actualiza tu plan para continuar usando ContentFlow
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Planes Disponibles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg border-2 p-6 ${
                plan.popular 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-1 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4" />
                    <span>Popular</span>
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {subscription?.plan_type === 'trial' ? 'Actualizar' : 'Cambiar Plan'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Historial de Facturación</h2>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>
        
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay historial de facturación</p>
          <p className="text-sm text-gray-400">Las facturas aparecerán aquí cuando actualices tu plan</p>
        </div>
      </div>
    </div>
  )
} 