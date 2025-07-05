import { NextRequest, NextResponse } from 'next/server';
import { contentRecyclingEngine } from '../../../lib/contentRecycling';
import { RecyclingRequest, RecyclingResponse } from '../../../types/recycling';

export async function POST(request: NextRequest) {
  try {
    const body: RecyclingRequest = await request.json();
    
    // Validaciones básicas
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El contenido es requerido' },
        { status: 400 }
      );
    }

    if (body.content.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'El contenido no puede exceder 10,000 caracteres' },
        { status: 400 }
      );
    }

    // Procesar el reciclaje
    const startTime = Date.now();
    const result = await contentRecyclingEngine.recycleContent(body);
    const processingTime = Date.now() - startTime;

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Agregar métricas de performance
    const response: RecyclingResponse & { metrics: { processingTime: number } } = {
      ...result,
      metrics: {
        processingTime
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error en API /api/recycle:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Content Recycling API',
      endpoints: {
        POST: '/api/recycle - Reciclar contenido en múltiples formatos'
      },
      supportedPlatforms: [
        'linkedin',
        'twitter', 
        'instagram',
        'facebook',
        'email',
        'quotes'
      ]
    },
    { status: 200 }
  );
} 