'use client'

import { Button } from '@/components/ui/button'
import { Plus, Wand2, FileText, Image, Video } from 'lucide-react'

export default function ContentGenerationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generación de Contenido</h1>
          <p className="text-gray-600">Crea contenido automático para tus redes sociales usando IA</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Contenido</span>
        </Button>
      </div>

      {/* Content Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <Button variant="outline" size="sm">
              Generar
            </Button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Post de Texto</h3>
          <p className="text-gray-600">Crea posts engaging para tus redes sociales</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-green-600" />
            </div>
            <Button variant="outline" size="sm">
              Generar
            </Button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Post con Imagen</h3>
          <p className="text-gray-600">Combina texto e imágenes para mayor impacto</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <Button variant="outline" size="sm">
              Generar
            </Button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Script de Video</h3>
          <p className="text-gray-600">Crea scripts para tus videos de redes sociales</p>
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenido Reciente</h2>
        <div className="text-center py-12">
          <Wand2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No has generado contenido aún</p>
          <p className="text-sm text-gray-400">Comienza creando tu primer post</p>
        </div>
      </div>
    </div>
  )
} 