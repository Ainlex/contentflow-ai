'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'
import { AuthButton } from '@/components/auth/auth-button'
import { Step1 } from '@/components/onboarding/step-1'
import { Step2 } from '@/components/onboarding/step-2'
import { Step3 } from '@/components/onboarding/step-3'
import { Step4 } from '@/components/onboarding/step-4'
import { Step5 } from '@/components/onboarding/step-5'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

interface OnboardingData {
  // Step 1
  company_name?: string
  company_size?: string
  role?: string
  website_url?: string
  // Step 2
  industry?: string
  target_audience?: string
  business_goals?: string[]
  // Step 3
  brand_voice_tone?: string
  content_examples?: string[]
  key_messages?: string
  words_to_avoid?: string
  // Step 4
  content_types?: string[]
  posting_frequency?: string
  content_themes?: string[]
  // Step 5
  social_accounts?: Record<string, boolean>
}

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  const totalSteps = 5

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('No user found, redirecting to login')
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Obtener perfil del usuario
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.log('Error fetching profile:', profileError)
        } else {
          setProfile(profileData)
          
          // Si ya completó el onboarding, redirigir al dashboard
          if (profileData.onboarding_completed) {
            router.push('/dashboard')
            return
          }

          // Cargar datos existentes del onboarding para resumir
          loadExistingData(profileData)
        }
      } catch (err) {
        console.log('Error getting user:', err)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  const loadExistingData = (profileData: any) => {
    const existingData: OnboardingData = {}
    
    if (profileData.company_name) existingData.company_name = profileData.company_name
    if (profileData.company_size) existingData.company_size = profileData.company_size
    if (profileData.role) existingData.role = profileData.role
    if (profileData.website_url) existingData.website_url = profileData.website_url
    if (profileData.industry) existingData.industry = profileData.industry
    if (profileData.target_audience) existingData.target_audience = profileData.target_audience
    if (profileData.business_goals) existingData.business_goals = profileData.business_goals
    if (profileData.brand_voice_tone) existingData.brand_voice_tone = profileData.brand_voice_tone
    if (profileData.content_examples) existingData.content_examples = profileData.content_examples
    if (profileData.key_messages) existingData.key_messages = profileData.key_messages
    if (profileData.words_to_avoid) existingData.words_to_avoid = profileData.words_to_avoid
    if (profileData.content_types) existingData.content_types = profileData.content_types
    if (profileData.posting_frequency) existingData.posting_frequency = profileData.posting_frequency
    if (profileData.content_themes) existingData.content_themes = profileData.content_themes
    if (profileData.social_accounts) existingData.social_accounts = profileData.social_accounts

    setOnboardingData(existingData)
  }

  const saveStepData = async (stepData: Partial<OnboardingData>) => {
    setSaving(true)
    setError(null)

    try {
      const updatedData = { ...onboardingData, ...stepData }
      setOnboardingData(updatedData)

      // Guardar en la base de datos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...stepData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      console.log(`Step ${currentStep} data saved successfully`)
    } catch (err) {
      console.error('Error saving step data:', err)
      setError('Error al guardar los datos. Intenta de nuevo.')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const completeOnboarding = async () => {
    setSaving(true)
    setError(null)

    try {
      // Marcar onboarding como completado
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      console.log('Onboarding completed successfully')
      
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Error completing onboarding:', err)
      setError('Error al completar el onboarding. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleStepNext = async (stepData: any) => {
    try {
      await saveStepData(stepData)
      
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        await completeOnboarding()
      }
    } catch (err) {
      // Error ya manejado en saveStepData
    }
  }

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    await completeOnboarding()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando onboarding...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Ya se está redirigiendo
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                ContentFlow Setup
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración Inicial
            </h1>
            <span className="text-sm font-medium text-gray-500">
              Paso {currentStep} de {totalSteps}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i + 1}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  i + 1 <= currentStep
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1 < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <Step1
              data={onboardingData}
              onNext={handleStepNext}
              isLoading={saving}
            />
          )}
          
          {currentStep === 2 && (
            <Step2
              data={onboardingData}
              onNext={handleStepNext}
              onBack={handleStepBack}
              isLoading={saving}
            />
          )}
          
          {currentStep === 3 && (
            <Step3
              data={onboardingData}
              onNext={handleStepNext}
              onBack={handleStepBack}
              isLoading={saving}
            />
          )}
          
          {currentStep === 4 && (
            <Step4
              data={onboardingData}
              onNext={handleStepNext}
              onBack={handleStepBack}
              isLoading={saving}
            />
          )}
          
          {currentStep === 5 && (
            <Step5
              data={onboardingData}
              onNext={handleStepNext}
              onBack={handleStepBack}
              onComplete={handleComplete}
              isLoading={saving}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Puedes volver a cualquier paso anterior o continuar más tarde.
            Tu progreso se guarda automáticamente.
          </p>
        </div>
      </div>
    </div>
  )
} 