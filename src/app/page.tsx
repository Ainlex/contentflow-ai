import Link from 'next/link'
import { AuthButton } from '@/components/auth/auth-button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                ContentFlow
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Crea Contenido{' '}
            <span className="text-indigo-600">Increíble</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            ContentFlow te ayuda a generar, programar y analizar contenido para tus redes sociales 
            con la potencia de la inteligencia artificial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="/auth/login"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="font-semibold text-xl mb-3">Generación IA</h3>
              <p className="text-gray-600">
                Crea contenido único y relevante con nuestra tecnología de inteligencia artificial avanzada.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="font-semibold text-xl mb-3">Programación</h3>
              <p className="text-gray-600">
                Programa y automatiza la publicación de contenido en múltiples redes sociales.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold text-xl mb-3">Analytics</h3>
              <p className="text-gray-600">
                Analiza el rendimiento de tu contenido y optimiza tu estrategia de marketing.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-sm text-gray-500">
            <p>Construido con Next.js 14, TypeScript, Tailwind CSS y Supabase</p>
          </div>
        </div>
      </main>
    </div>
  )
} 