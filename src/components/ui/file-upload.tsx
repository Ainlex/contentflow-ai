'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // en MB
  className?: string
  currentImage?: string
  onRemove?: () => void
}

export function FileUpload({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5, 
  className,
  currentImage,
  onRemove
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File) => {
    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo debe ser menor a ${maxSize}MB`)
      return false
    }

    // Validar tipo
    if (accept === "image/*" && !file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen')
      return false
    }

    setError(null)
    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview actual */}
      {currentImage && (
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
          <img 
            src={currentImage} 
            alt="Foto de perfil" 
            className="w-full h-full object-cover"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Área de drag & drop */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400',
          error && 'border-red-300 bg-red-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="space-y-2">
          {accept === "image/*" ? (
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          )}
          
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              {isDragging ? 'Suelta el archivo aquí' : 'Haz clic para seleccionar o arrastra aquí'}
            </p>
            <p className="text-xs text-gray-500">
              {accept === "image/*" ? 'PNG, JPG, GIF' : 'Archivos permitidos'} hasta {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
} 