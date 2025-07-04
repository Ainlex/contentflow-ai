'use client'

import { Button } from '@/components/ui/button'
import { Plus, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarPage() {
  const today = new Date()
  const month = today.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario Social</h1>
          <p className="text-gray-600">Programa y gestiona tus publicaciones</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Programar Post</span>
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">{month}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => {
            const dayNumber = i - 6 + 1
            const isCurrentMonth = dayNumber > 0 && dayNumber <= 31
            const isToday = dayNumber === today.getDate()
            
            return (
              <div
                key={i}
                className={`
                  min-h-[80px] p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                `}
              >
                <div className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                  {isCurrentMonth ? dayNumber : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Posts */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Publicaciones</h2>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes publicaciones programadas</p>
          <p className="text-sm text-gray-400">Programa tu primera publicación</p>
        </div>
      </div>
    </div>
  )
} 