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

  async recycleContent(request: RecyclingRequest): Promise<RecyclingResponse & { costData?: any }> {
    try {
      const { content, platforms = Object.keys(PLATFORM_CONFIGS) as Platform[], tone = 'professional', industry } = request;
      
      if (!content.trim()) {
        return { success: false, error: 'El contenido no puede estar vacío' };
      }

      const formats: ContentFormat[] = [];
      let totalTokens = 0;
      const platformBreakdown: Record<string, { tokens: number; cost: number }> = {};
      const promises = platforms.map(async (platform) => {
        const before = content.length;
        const result = await this.generateFormat(content, platform, tone, industry);
        // Estimar tokens: 1 token ≈ 4 chars
        const tokens = result ? Math.ceil((result.content?.length || 0) / 4) : 0;
        const cost = tokens * 0.00015; // gpt-4o-mini $0.15/1K tokens
        totalTokens += tokens;
        platformBreakdown[platform] = { tokens, cost };
        return result;
      });
      
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
      const totalCost = totalTokens * 0.00015;
      return { success: true, recycledContent, costData: { totalTokens, totalCost, platformBreakdown } };
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
      const isEmail = platform === 'email';
      const systemMessage = isEmail
        ? `You must respond with ONLY valid JSON. No additional text.\nGenerate email content and return ONLY this JSON structure:\n{\n"subject": "clear subject line",\n"greeting": "Hola {{name}}",\n"intro": "personalized intro",\n"body": "main content 2-3 paragraphs",\n"callToAction": "specific CTA",\n"signature": "Saludos, El equipo de {{company}}"\n}\nMANDATORY: Return ONLY JSON, no markdown, no explanation.`
        : "Eres un experto en marketing digital y creación de contenido. Tu tarea es reciclar contenido existente en formatos optimizados para diferentes plataformas sociales, respetando los límites de caracteres y el tono específico de cada plataforma.";
      const model = process.env.OPENAI_MODEL_DEV || 'gpt-4o-mini';
      const supportsJsonMode = [
        'gpt-4-1106-preview',
        'gpt-4-turbo',
        'gpt-3.5-turbo-1106',
        'gpt-4o-mini'
      ].includes(model);
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        ...(isEmail && supportsJsonMode ? { response_format: { type: "json_object" } } : {})
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

IMPORTANTE: Devuelve SOLO un JSON válido, sin texto adicional, con la siguiente estructura:
{
  "content": ["quote1", "quote2", "quote3", ...], // Array de 3 a 5 citas, cada una de 50-150 caracteres
  "hashtags": ["hashtag1", "hashtag2"],
  "characterCount": [longitud de cada quote],
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
        - Máximo 2-3 hashtags estratégicos y trending por tweet, enfocados en engagement y retweet potential
        - No usar hashtags genéricos ni spam
        - Verifica que cada tweet no exceda 280 caracteres incluyendo hashtags
      `,
      instagram: `
        - Enfoque visual y emocional
        - Incluir emojis apropiados
        - Hashtags populares y de nicho, máximo 8-10 por post
        - No usar hashtags genéricos como #Amor, #Felicidad, #Familia
        - Prioriza hashtags específicos al contenido: mezcla 3-4 populares, 3-4 de nicho, 2-3 de marca
        - Call-to-action para engagement
        - Verifica que el caption no exceda 2200 caracteres incluyendo hashtags
      `,
      facebook: `
        - Tono conversacional y amigable
        - Preguntas para generar engagement
        - Contenido que invite a comentarios
        - Incluir elementos personales
      `,
      email: `
        - Estructura profesional B2B para email newsletter
        - Subject: línea atractiva y relevante
        - Saludo: "Hola {{name}}," siempre al inicio
        - Intro/hook personalizado (1-2 frases)
        - Cuerpo principal: 2-3 párrafos orientados a negocios, claros y concisos
        - Call-to-action claro y específico (ej: "Responde a este email para...", "Solicita tu demo aquí")
        - Firma profesional: "Saludos, [Nombre/Equipo]", seguido de {{company}}
        - Usa lenguaje profesional, directo y relevante para B2B SaaS
        - No uses frases genéricas ni despedidas informales
        - Devuelve SOLO un JSON válido con las claves: subject, greeting, intro, body, callToAction, signature
        - EJEMPLO DE RESPUESTA JSON (no incluyas texto fuera del JSON):
{
  "subject": "[línea atractiva]",
  "greeting": "Hola {{name}},",
  "intro": "[intro personalizada]",
  "body": "[cuerpo principal]",
  "callToAction": "[CTA claro]",
  "signature": "Saludos, El equipo de {{company}}"
}
        - MANDATORY: Response must be ONLY valid JSON. No markdown, no explanation, no texto extra.
      `,
      quotes: `
        - Extraer 3-5 citas inspiradoras
        - Cada cita debe ser memorable y tener entre 50 y 150 caracteres
        - Devuelve un array de citas
        - No repitas frases
        - No incluyas texto adicional fuera del JSON
      `
    };

    return basePrompt + (platformPrompts[platform] || '');
  }

  private parseResponse(response: string, platform: Platform, config: any): ContentFormat {
    try {
      // Limpiar response: buscar el primer y último { }
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let parsed;
      if (jsonMatch) {
        let jsonStr = jsonMatch[0]
          .replace(/^[^\{]*/, '')
          .replace(/[^\}]*$/, '');
        try {
          parsed = JSON.parse(jsonStr);
        } catch (err) {
          console.error('Error parseando JSON limpio:', err, jsonStr);
          throw err;
        }
        // Quotes: devolver array de objetos {quote, characterCount}
        if (platform === 'quotes' && Array.isArray(parsed.content)) {
          const quotesArr = parsed.content.map((q: string) => ({ quote: q, characterCount: (q as string).length }));
          return {
            id: this.generateId(),
            platform,
            content: quotesArr,
            characterCount: quotesArr.map((q: { quote: string, characterCount: number }) => q.characterCount),
            hashtags: parsed.hashtags || [],
            isEdited: false,
            metadata: parsed.metadata || {}
          };
        }
        // Email: guardar estructura en metadata.email y content como string formateado
        if (platform === 'email' && parsed.subject) {
          const emailMeta = {
            subject: parsed.subject,
            greeting: parsed.greeting,
            intro: parsed.intro,
            body: parsed.body,
            callToAction: parsed.callToAction,
            signature: parsed.signature,
            previewText: parsed.previewText
          };
          const emailContent = `${parsed.greeting}\n\n${parsed.intro}\n\n${parsed.body}\n\n${parsed.callToAction}\n\n${parsed.signature}`;
          return {
            id: this.generateId(),
            platform,
            content: emailContent,
            characterCount: emailContent.length,
            hashtags: parsed.hashtags || [],
            isEdited: false,
            metadata: { email: emailMeta }
          };
        }
        // Calcular characterCount real
        let contentStr = parsed.content || response;
        let charCount;
        if (platform === 'twitter' && Array.isArray(parsed.content)) {
          contentStr = parsed.content.join('\n\n');
          charCount = Math.max(...parsed.content.map((t: string) => t.length));
        } else if (Array.isArray(contentStr)) {
          // Para cualquier otra plataforma, unir el array en un string
          contentStr = contentStr.join('\n');
          charCount = contentStr.length;
        } else {
          charCount = contentStr.length;
        }
        return {
          id: this.generateId(),
          platform,
          content: contentStr,
          characterCount: charCount,
          hashtags: parsed.hashtags || [],
          isEdited: false,
          metadata: parsed.metadata || {}
        };
      }
      // Fallback: si no hay JSON válido, log y devolver como texto plano
      console.warn('No se detectó JSON válido en la respuesta:', response);
      return {
        id: this.generateId(),
        platform,
        content: response,
        characterCount: response.length,
        hashtags: [],
        isEdited: false
      };
    } catch (error) {
      // Fallback robusto
      console.error('Error parseando respuesta:', error, response);
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