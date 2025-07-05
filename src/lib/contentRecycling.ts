import { openai } from './openai';
import { 
  RecycledContent, 
  ContentFormat, 
  Platform, 
  RecyclingRequest, 
  RecyclingResponse,
  PLATFORM_CONFIGS 
} from '../types/recycling';

export class ContentRecyclingEngine {
  private static instance: ContentRecyclingEngine;

  private constructor() {}

  static getInstance(): ContentRecyclingEngine {
    if (!ContentRecyclingEngine.instance) {
      ContentRecyclingEngine.instance = new ContentRecyclingEngine();
    }
    return ContentRecyclingEngine.instance;
  }

  async recycleContent(request: RecyclingRequest): Promise<RecyclingResponse> {
    try {
      const { content, platforms = Object.keys(PLATFORM_CONFIGS) as Platform[], tone = 'professional', industry } = request;
      
      if (!content.trim()) {
        return { success: false, error: 'El contenido no puede estar vacío' };
      }

      const formats: ContentFormat[] = [];
      const promises = platforms.map(platform => this.generateFormat(content, platform, tone, industry));
      
      const results = await Promise.all(promises);
      
      for (let i = 0; i < results.length; i++) {
        if (results[i]) {
          formats.push(results[i]!);
        }
      }

      const recycledContent: RecycledContent = {
        id: this.generateId(),
        originalContent: content,
        formats,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return { success: true, recycledContent };
    } catch (error) {
      console.error('Error en ContentRecyclingEngine:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido en el reciclaje de contenido' 
      };
    }
  }

  private async generateFormat(
    content: string, 
    platform: Platform, 
    tone: string, 
    industry?: string
  ): Promise<ContentFormat | null> {
    try {
      const config = PLATFORM_CONFIGS[platform];
      const prompt = this.buildPrompt(content, platform, config, tone, industry);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Eres un experto en marketing digital y creación de contenido. Tu tarea es reciclar contenido existente en formatos optimizados para diferentes plataformas sociales, respetando los límites de caracteres y el tono específico de cada plataforma."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error(`No se pudo generar contenido para ${platform}`);
      }

      const parsed = this.parseResponse(response, platform, config);
      return parsed;
    } catch (error) {
      console.error(`Error generando formato para ${platform}:`, error);
      return null;
    }
  }

  private buildPrompt(content: string, platform: Platform, config: any, tone: string, industry?: string): string {
    const basePrompt = `
Recicla el siguiente contenido en un formato optimizado para ${config.description}.

CONTENIDO ORIGINAL:
${content}

REQUISITOS:
- Máximo ${config.maxCharacters} caracteres
- Tono: ${config.tone}
- Plataforma: ${platform}
- Incluir hashtags relevantes (máximo ${config.hashtagLimit})
${industry ? `- Industria: ${industry}` : ''}

FORMATO DE RESPUESTA (JSON):
{
  "content": "contenido generado",
  "hashtags": ["hashtag1", "hashtag2"],
  "characterCount": 123,
  "metadata": {}
}
`;

    // Prompts específicos por plataforma
    const platformPrompts = {
      linkedin: `
        - Enfoque profesional y de networking
        - Incluir insights valiosos
        - Usar lenguaje corporativo apropiado
        - Terminar con call-to-action profesional
      `,
      twitter: `
        - Crear 5 tweets conectados como hilo
        - Cada tweet debe ser independiente pero conectado
        - Usar numeración (1/5, 2/5, etc.)
        - Incluir engagement hooks
      `,
      instagram: `
        - Enfoque visual y emocional
        - Incluir emojis apropiados
        - Hashtags populares y relevantes
        - Call-to-action para engagement
      `,
      facebook: `
        - Tono conversacional y amigable
        - Preguntas para generar engagement
        - Contenido que invite a comentarios
        - Incluir elementos personales
      `,
      email: `
        - Asunto atractivo y claro
        - Cuerpo del email bien estructurado
        - Call-to-action claro
        - Tono profesional pero accesible
      `,
      quotes: `
        - Extraer 3-5 citas inspiradoras
        - Cada cita debe ser memorable
        - Máximo 200 caracteres por cita
        - Incluir atribución si es relevante
      `
    };

    return basePrompt + (platformPrompts[platform] || '');
  }

  private parseResponse(response: string, platform: Platform, config: any): ContentFormat {
    try {
      // Intentar parsear JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: this.generateId(),
          platform,
          content: parsed.content || response,
          characterCount: parsed.characterCount || response.length,
          hashtags: parsed.hashtags || [],
          isEdited: false,
          metadata: parsed.metadata || {}
        };
      }

      // Fallback si no hay JSON válido
      return {
        id: this.generateId(),
        platform,
        content: response,
        characterCount: response.length,
        hashtags: [],
        isEdited: false
      };
    } catch (error) {
      console.error('Error parseando respuesta:', error);
      return {
        id: this.generateId(),
        platform,
        content: response,
        characterCount: response.length,
        hashtags: [],
        isEdited: false
      };
    }
  }

  private generateId(): string {
    return `recycled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Método para validar límites de caracteres
  validateCharacterLimits(content: string, platform: Platform): boolean {
    const config = PLATFORM_CONFIGS[platform];
    return content.length <= config.maxCharacters;
  }

  // Método para extraer hashtags
  extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return content.match(hashtagRegex) || [];
  }

  // Método para contar caracteres
  countCharacters(content: string): number {
    return content.length;
  }
}

// Exportar instancia singleton
export const contentRecyclingEngine = ContentRecyclingEngine.getInstance(); 