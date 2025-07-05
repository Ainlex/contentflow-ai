export interface RecycledContent {
  id: string;
  originalContent: string;
  formats: ContentFormat[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentFormat {
  id: string;
  platform: Platform;
  content: string;
  characterCount: number;
  hashtags: string[];
  isEdited: boolean;
  metadata?: PlatformMetadata;
}

export type Platform = 
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'email'
  | 'quotes';

export interface PlatformMetadata {
  linkedin?: {
    professional: boolean;
    industry?: string;
  };
  twitter?: {
    threadPosition?: number;
    totalThreads?: number;
  };
  instagram?: {
    visualFocus: boolean;
    imageDescription?: string;
  };
  facebook?: {
    conversational: boolean;
    engagementPrompt?: string;
  };
  email?: {
    subject: string;
    greeting: string;
    intro: string;
    body: string;
    callToAction: string;
    signature: string;
    previewText?: string;
  };
  quotes?: {
    quoteNumber: number;
    totalQuotes: number;
  };
}

export interface RecyclingRequest {
  content: string;
  platforms?: Platform[];
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative';
  industry?: string;
}

export interface RecyclingResponse {
  success: boolean;
  recycledContent?: RecycledContent;
  error?: string;
}

export interface PlatformConfig {
  platform: Platform;
  maxCharacters: number;
  hashtagLimit: number;
  tone: string;
  format: string;
  description: string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  linkedin: {
    platform: 'linkedin',
    maxCharacters: 3000,
    hashtagLimit: 5,
    tone: 'professional',
    format: 'post',
    description: 'Post profesional para LinkedIn'
  },
  twitter: {
    platform: 'twitter',
    maxCharacters: 280,
    hashtagLimit: 3,
    tone: 'conversational',
    format: 'thread',
    description: 'Hilo de Twitter (5 tweets)'
  },
  instagram: {
    platform: 'instagram',
    maxCharacters: 2200,
    hashtagLimit: 30,
    tone: 'visual',
    format: 'caption',
    description: 'Caption para Instagram con enfoque visual'
  },
  facebook: {
    platform: 'facebook',
    maxCharacters: 500,
    hashtagLimit: 8,
    tone: 'conversational',
    format: 'post',
    description: 'Post conversacional para Facebook'
  },
  email: {
    platform: 'email',
    maxCharacters: 10000,
    hashtagLimit: 0,
    tone: 'professional',
    format: 'newsletter',
    description: 'Newsletter por email con asunto'
  },
  quotes: {
    platform: 'quotes',
    maxCharacters: 150,
    hashtagLimit: 0,
    tone: 'inspirational',
    format: 'quote',
    description: 'Citas inspiradoras extraídas del contenido'
  }
}; 