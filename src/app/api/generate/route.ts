import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/openai'
import { ContentGenerationRequest } from '@/types/content'
import { calculateCost, saveCostBreakdown, getCurrentModel } from '@/lib/costCalculator'

export async function POST(request: NextRequest) {
  try {
    console.log('API endpoint called')
    const body: ContentGenerationRequest = await request.json()
    console.log('Request body:', body)
    
    // Validar datos requeridos
    if (!body.topic || !body.tone || !body.targetAudience || !body.contentType) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar tipos de contenido permitidos
    const allowedContentTypes = ['linkedin', 'twitter', 'instagram', 'facebook', 'blog']
    if (!allowedContentTypes.includes(body.contentType)) {
      return NextResponse.json(
        { error: 'Tipo de contenido no válido' },
        { status: 400 }
      )
    }

    // Generar contenido con streaming y cost tracking
    const stream = await generateContentWithCostTracking({
      topic: body.topic,
      tone: body.tone,
      targetAudience: body.targetAudience,
      contentType: body.contentType,
      additionalContext: body.additionalContext,
    })

    // Retornar respuesta con streaming
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    })
  } catch (error) {
    console.error('Error en generación de contenido:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// Wrapper para generar contenido con cost tracking
async function generateContentWithCostTracking(options: any) {
  console.log('Starting content generation with cost tracking')
  
  // Generar contenido normal
  const stream = await generateContent(options)
  
  // Estimar tokens de input (aproximado)
  const inputText = `${options.topic} ${options.targetAudience} ${options.additionalContext || ''}`
  const inputTokens = Math.ceil(inputText.length / 4)
  console.log('Input tokens estimated:', inputTokens)
  
  // Crear nuevo stream que trackea costos
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  let outputTokens = 0
  let generatedContent = ''
  const currentModel = getCurrentModel()
  
  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader()
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('Stream completed. Final output tokens:', outputTokens)
            
            // Enviar mensaje de finalización del contenido
            const finalContentMessage = {
              content: '',
              isComplete: true,
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalContentMessage)}\n\n`))
            
            // Calcular y enviar costos ANTES de cerrar
            try {
              const costBreakdown = calculateCost(inputTokens, outputTokens, currentModel)
              console.log('Cost breakdown calculated:', costBreakdown)
              
              // Enviar datos de costo como mensaje especial
              const costMessage = {
                type: 'cost_tracking',
                data: costBreakdown
              }
              
              console.log('Sending cost message:', costMessage)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(costMessage)}\n\n`))
            } catch (costError) {
              console.error('Error calculating costs:', costError)
            }
            
            controller.close()
            break
          }
          
          // Procesar chunk para contar tokens
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              if (data.trim()) {
                try {
                  const parsed = JSON.parse(data)
                  
                  if (parsed.content) {
                    generatedContent += parsed.content
                    outputTokens = Math.ceil(generatedContent.length / 4)
                  }
                } catch (e) {
                  // Ignorar errores de parsing
                }
              }
            }
          }
          
          // Reenviar chunk original
          controller.enqueue(value)
        }
      } catch (error) {
        console.error('Error in streaming:', error)
        controller.error(error)
      } finally {
        reader.releaseLock()
      }
    }
  })
}

// Configurar el runtime para nodejs (mejor compatibilidad para debugging)
export const runtime = 'nodejs' 