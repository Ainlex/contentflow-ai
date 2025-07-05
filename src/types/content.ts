// Tipos para generación de contenido

export type ContentType = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'blog'

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
    maxLength: 3000,
    description: 'Posts profesionales para networking y thought leadership',
    icon: '💼',
    color: 'text-blue-600',
    features: ['Professional tone', 'Industry insights', 'Networking focus', 'Hashtags'],
  },
  twitter: {
    name: 'Twitter/X',
    maxLength: 280,
    description: 'Tweets concisos y impactantes',
    icon: '🐦',
    color: 'text-black',
    features: ['Concise messaging', 'Trending topics', 'Engagement focus', 'Hashtags'],
  },
  instagram: {
    name: 'Instagram',
    maxLength: 2200,
    description: 'Posts visuales con storytelling',
    icon: '📸',
    color: 'text-pink-600',
    features: ['Visual storytelling', 'Emojis', 'Hashtags', 'Engagement'],
  },
  facebook: {
    name: 'Facebook',
    maxLength: 500,
    description: 'Posts conversacionales para comunidad',
    icon: '📘',
    color: 'text-blue-700',
    features: ['Community focus', 'Conversational', 'Engagement', 'Personal touch'],
  },
  blog: {
    name: 'Blog Post',
    maxLength: 1500,
    description: 'Artículos estructurados con profundidad',
    icon: '📝',
    color: 'text-green-600',
    features: ['In-depth content', 'SEO optimized', 'Structured format', 'Thought leadership'],
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