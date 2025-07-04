'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Calendar, 
  Users, 
  BarChart3, 
  Clock, 
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

interface DashboardData {
  profile: any
  subscription: any
  usage: any
  stats: {
    aiGenerations: number
    postsScheduled: number
    socialAccounts: number
    trialDaysRemaining: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth/login')
          return
        }

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.log('Error fetching profile:', profileError)
          return
        }

        // Fetch subscription data
        const { data: subscriptionData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (subError) {
          console.log('Error fetching subscription:', subError)
        }

        // Fetch usage data
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
        const { data: usageData, error: usageError } = await supabase
          .from('usage_tracking')
          .select('*')
          .eq('user_id', user.id)
          .eq('month_year', currentMonth)
          .single()

        if (usageError) {
          console.log('Error fetching usage:', usageError)
        }

        // Calculate trial days remaining
        const trialDaysRemaining = subscriptionData?.trial_ends_at 
          ? Math.max(0, Math.ceil((new Date(subscriptionData.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
          : 0

        setData({
          profile: profileData,
          subscription: subscriptionData,
          usage: usageData,
          stats: {
            aiGenerations: usageData?.ai_generations_used || 0,
            postsScheduled: 0, // TODO: Implement posts table
            socialAccounts: usageData?.social_accounts_connected || 0,
            trialDaysRemaining
          }
        })
      } catch (err) {
        console.log('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, supabase])

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días'
    if (hour < 18) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  const getTrialStatus = () => {
    if (!data?.subscription || data.subscription.plan_type !== 'trial') return null
    
    const daysRemaining = data.stats.trialDaysRemaining
    if (daysRemaining <= 0) return { type: 'expired', message: 'Tu trial ha expirado' }
    if (daysRemaining <= 3) return { type: 'warning', message: `${daysRemaining} días restantes` }
    return { type: 'active', message: `${daysRemaining} días de trial` }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar los datos del dashboard</p>
      </div>
    )
  }

  const trialStatus = getTrialStatus()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getWelcomeMessage()}, {data.profile.company_name || 'Usuario'}!
            </h1>
            <p className="text-indigo-100 mt-1">
              Bienvenido a tu dashboard de ContentFlow
            </p>
          </div>
          
          {trialStatus && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              trialStatus.type === 'expired' ? 'bg-red-500' :
              trialStatus.type === 'warning' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}>
              {trialStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Generaciones IA</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.aiGenerations}</p>
              <p className="text-xs text-gray-500">este mes</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(100, (data.stats.aiGenerations / 50) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Límite: 50/mes</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Posts Programados</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.postsScheduled}</p>
              <p className="text-xs text-gray-500">próximos 7 días</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Redes Conectadas</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.socialAccounts}</p>
              <p className="text-xs text-gray-500">plataformas</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Días de Trial</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.trialDaysRemaining}</p>
              <p className="text-xs text-gray-500">restantes</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => router.push('/dashboard/content')}
                className="flex items-center justify-between p-4 h-auto bg-indigo-600 hover:bg-indigo-700"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Generar Contenido</div>
                    <div className="text-sm text-indigo-100">Crear posts con IA</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button 
                onClick={() => router.push('/dashboard/calendar')}
                variant="outline"
                className="flex items-center justify-between p-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Programar Post</div>
                    <div className="text-sm text-gray-500">Calendario social</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button 
                onClick={() => router.push('/dashboard/settings')}
                variant="outline"
                className="flex items-center justify-between p-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Conectar Redes</div>
                    <div className="text-sm text-gray-500">Integrar plataformas</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button 
                onClick={() => router.push('/dashboard/analytics')}
                variant="outline"
                className="flex items-center justify-between p-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Ver Analytics</div>
                    <div className="text-sm text-gray-500">Métricas y stats</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Perfil completado</p>
                <p className="text-xs text-gray-500">hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Cuenta creada</p>
                <p className="text-xs text-gray-500">hace 3 horas</p>
              </div>
            </div>
            
            <div className="text-center py-6">
              <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Empieza a generar contenido para ver más actividad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      {trialStatus && trialStatus.type !== 'active' && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">
                  {trialStatus.type === 'expired' ? 'Trial Expirado' : 'Trial Terminando'}
                </h3>
                <p className="text-sm text-orange-100">
                  Actualiza tu plan para continuar usando ContentFlow
                </p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/billing')}
              className="bg-white text-orange-600 hover:bg-orange-50"
            >
              Actualizar Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 