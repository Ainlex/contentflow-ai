// Tipos para generación de contenido

export type ContentType = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'email'

export type ToneType = 
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'authoritative'
  | 'inspirational'
  | 'humorous'
  | 'educational'
  | 'conversational'

export interface ContentGenerationRequest {
  topic: string
  tone: ToneType
  targetAudience: string
  contentType: ContentType
  additionalContext?: string
}

export interface ContentGenerationResponse {
  content: string
  contentType: ContentType
  generatedAt: Date
  wordCount: number
  characterCount: number
}

export interface StreamingMessage {
  content: string
  isComplete: boolean
  error?: string
}

export interface ContentGenerationState {
  isGenerating: boolean
  generatedContent: string
  error: string | null
  isComplete: boolean
  progress: number
}

export interface ContentPlatformConfig {
  name: string
  maxLength: number
  description: string
  icon: string
  color: string
  features: string[]
}

export const CONTENT_PLATFORMS: Record<ContentType, ContentPlatformConfig> = {
  linkedin: {
    name: 'LinkedIn',
    maxLength: 1300,
    description: 'Post profesional para LinkedIn',
    icon: '🔗',
    color: 'text-blue-700',
    features: ['Networking', 'Tono profesional', 'Insights', 'CTA']
  },
  twitter: {
    name: 'Twitter',
    maxLength: 280,
    description: 'Hilo de Twitter (5 tweets)',
    icon: '🐦',
    color: 'text-sky-500',
    features: ['Hilo', 'Engagement', 'Brevity', 'Numeración']
  },
  instagram: {
    name: 'Instagram',
    maxLength: 2200,
    description: 'Caption visual para Instagram',
    icon: '📸',
    color: 'text-pink-500',
    features: ['Visual', 'Emojis', 'Hashtags', 'Engagement']
  },
  facebook: {
    name: 'Facebook',
    maxLength: 500,
    description: 'Post conversacional para Facebook',
    icon: '📘',
    color: 'text-blue-800',
    features: ['Conversacional', 'Preguntas', 'Personal', 'Engagement']
  },
  email: {
    name: 'Email Newsletter',
    maxLength: 10000,
    description: 'Newsletter profesional por email',
    icon: '✉️',
    color: 'text-gray-700',
    features: ['Subject ~50 chars', 'Body 500-1000 palabras', 'Personalización', 'CTA']
  },
}

export const TONE_OPTIONS: Record<ToneType, { name: string; description: string; example: string }> = {
  professional: {
    name: 'Profesional',
    description: 'Formal, autoritativo y centrado en el negocio',
    example: 'Como expertos en la industria, hemos observado...',
  },
  casual: {
    name: 'Casual',
    description: 'Relajado, accesible y conversacional',
    example: 'Hey! Quería compartir algo interesante que aprendí...',
  },
  friendly: {
    name: 'Amigable',
    description: 'Cálido, personal y cercano',
    example: 'Me encanta cuando puedo ayudar a otros con...',
  },
  authoritative: {
    name: 'Autoritativo',
    description: 'Confiado, experto y definitivo',
    example: 'Los datos claramente demuestran que...',
  },
  inspirational: {
    name: 'Inspiracional',
    description: 'Motivador, optimista y empoderador',
    example: 'Cada desafío es una oportunidad para crecer...',
  },
  humorous: {
    name: 'Humorístico',
    description: 'Divertido, ligero y entretenido',
    example: 'Si fuera fácil, todos lo estarían haciendo, ¿verdad?',
  },
  educational: {
    name: 'Educativo',
    description: 'Informativo, claro y estructurado',
    example: 'Aquí están los 3 pasos clave para...',
  },
  conversational: {
    name: 'Conversacional',
    description: 'Natural, como hablando con un amigo',
    example: '¿Sabes qué me parece fascinante? El hecho de que...',
  },
}

export interface ContentGenerationError {
  code: string
  message: string
  details?: string
}

export interface ContentGenerationMetrics {
  totalGenerations: number
  successRate: number
  averageGenerationTime: number
  mostUsedContentType: ContentType
  mostUsedTone: ToneType
} 