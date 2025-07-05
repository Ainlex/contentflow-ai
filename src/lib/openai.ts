import OpenAI from 'openai'

// Configurar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Verificar que la API key esté configurada
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export interface GenerationOptions {
  topic: string
  tone: string
  targetAudience: string
  contentType: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'blog'
  additionalContext?: string
}

export interface StreamingMessage {
  content: string
  isComplete: boolean
  error?: string
}

// Prompts específicos para cada plataforma
const PLATFORM_PROMPTS = {
  linkedin: {
    maxLength: 3000,
    format: 'Crea un post profesional para LinkedIn que genere engagement. Incluye:\n- Hook inicial atractivo\n- Contenido valioso con insights\n- Call-to-action al final\n- Hashtags relevantes (#)\n- Formato profesional pero accesible',
  },
  twitter: {
    maxLength: 280,
    format: 'Crea un tweet conciso y impactante que:\n- Capture atención inmediatamente\n- Transmita el mensaje clave\n- Incluya 2-3 hashtags relevantes\n- Sea fácil de compartir\n- Máximo 280 caracteres',
  },
  instagram: {
    maxLength: 2200,
    format: 'Crea un post para Instagram que:\n- Tenga un hook visual/emocional\n- Cuente una historia breve\n- Incluya emojis apropiados\n- Termine con call-to-action\n- Incluya hashtags estratégicos (#)',
  },
  facebook: {
    maxLength: 500,
    format: 'Crea un post para Facebook que:\n- Sea conversacional y personal\n- Genere comentarios y engagement\n- Incluya pregunta o call-to-action\n- Tenga el tono apropiado para la audiencia\n- Sea fácil de leer',
  },
  blog: {
    maxLength: 1500,
    format: 'Crea un extracto de blog post que:\n- Tenga título atractivo\n- Introducción que enganche\n- 3-4 puntos clave desarrollados\n- Conclusión con call-to-action\n- Estructura clara con subtítulos',
  },
}

export async function generateContent(
  options: GenerationOptions
): Promise<ReadableStream<Uint8Array>> {
  const { topic, tone, targetAudience, contentType, additionalContext } = options
  
  const platformConfig = PLATFORM_PROMPTS[contentType]
  
  const systemPrompt = `Eres un experto en marketing de contenido y copywriting. Tu tarea es crear contenido optimizado para ${contentType.toUpperCase()} que genere engagement y conversiones.

INSTRUCCIONES ESPECÍFICAS:
${platformConfig.format}

RESTRICCIONES:
- Máximo ${platformConfig.maxLength} caracteres
- Tono: ${tone}
- Audiencia objetivo: ${targetAudience}
- Idioma: Español
- Debe ser original y auténtico
- Evita información genérica`

  const userPrompt = `Tema: ${topic}

${additionalContext ? `Contexto adicional: ${additionalContext}` : ''}

Por favor, genera contenido optimizado siguiendo las instrucciones específicas para ${contentType}.`

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    })

    // Crear ReadableStream personalizado
    const encoder = new TextEncoder()
    
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            
            if (content) {
              const data: StreamingMessage = {
                content,
                isComplete: false,
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            }
          }
          
          // Enviar mensaje de finalización
          const finalData: StreamingMessage = {
            content: '',
            isComplete: true,
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`))
          controller.close()
        } catch (error) {
          const errorData: StreamingMessage = {
            content: '',
            isComplete: true,
            error: error instanceof Error ? error.message : 'Error generating content',
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
          controller.close()
        }
      },
    })
  } catch (error) {
    throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export { openai } 